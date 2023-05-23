import CircularProgress from "@mui/material/CircularProgress"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import Logo from "assets/images/logo.png"
import WelcomeMonkey from "assets/images/welcome-monkey.png"
import { useEffect, useRef, useState } from "react"
import * as FirebaseAuth from "firebase/auth"
import { useDispatch } from "react-redux"
import { setAuth } from "store/app-reducer"
import { AuthService } from "api/rest/services"
import { setServerAuthToken } from "config"
import { AuthPageGuard } from "guards"
import "./styles.scss"


/**
 * Login page to login using phone number
 */
export default function LoginPage() {

    // states
    const dispatch = useDispatch()
    const [isProgressActive, setProgressActive] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState("")
    const [code, setCode] = useState("")
    const loginFormRef = useRef(null)
    const authRef = useRef(FirebaseAuth.getAuth())
    const recaptchaVerifierRef = useRef(null)
    const confirmationResultRef = useRef(null)

    // actions
    const sendOTP = () => {
        setProgressActive(true)
        FirebaseAuth.signInWithPhoneNumber(authRef.current, `+91${phoneNumber}`, recaptchaVerifierRef.current)
            .then(confirmationResult => {
                confirmationResultRef.current = confirmationResult
                setProgressActive(false)
                const loginForm = loginFormRef.current
                loginForm.scroll({ left: (loginForm.scrollWidth / 2), behavior: "smooth" })
            }).catch(console.log)
    }

    const resetPhoneNumber = () => {
        loginFormRef.current.scroll({ left: 0, behavior: "smooth" })
    }

    const verifyOTP = () => {
        confirmationResultRef.current.confirm(code).then(credential => {
            credential.user.getIdToken().then(firebaseAuthToken => {
                AuthService.login(firebaseAuthToken).then((serverAuthToken) => {
                    setServerAuthToken(serverAuthToken)
                    dispatch(setAuth({ isAuthenticated: true }))
                    window.location.reload()
                })
            }).catch(console.log)
        }).catch(console.log)
    }

    useEffect(() => {
        recaptchaVerifierRef.current = new FirebaseAuth.RecaptchaVerifier("recaptcha-container", { "size": "invisible" }, authRef.current)
    }, [])

    return (
        <>
            <AuthPageGuard>
                <div id="login-page" className="page">

                    <div className="login-form" ref={loginFormRef}>

                        <section className="login-form__step">
                            <img src={Logo} alt="telegram-logo" className="form__logo" />
                            <h1 className="step__title">Sign in to Telegram</h1>
                            <h4 className="step__description">Please confirm your country and enter your phone number</h4>
                            <TextField
                                value={phoneNumber}
                                onChange={ev => setPhoneNumber(ev.target.value)}
                                label="Phone Number" />
                            <Button variant="contained" disabled={isProgressActive} onClick={sendOTP}>
                                {isProgressActive ? (
                                    <>
                                        <span>Please Wait... </span>
                                        <CircularProgress color="inherit" />
                                    </>
                                ) : "Next"}
                            </Button>
                        </section>

                        <section className="login-form__step">
                            <img src={WelcomeMonkey} alt="" className="step__image" />
                            <h1 className="step__title">
                                +91 {phoneNumber}<EditOutlinedIcon onClick={resetPhoneNumber} />
                            </h1>
                            <h4 className="step__description">
                                We have sent you a message in SMS with the code.
                            </h4>
                            <TextField value={code}
                                onChange={ev => setCode(ev.target.value)}
                                label="Code" />
                            <Button variant="contained" onClick={verifyOTP}>Verify OTP</Button>
                        </section>
                    </div>
                </div>
            </AuthPageGuard>
            <div id="recaptcha-container"></div>
        </>
    )
}