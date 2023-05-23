import { useEffect } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { useDispatch } from 'react-redux'
import { fetchLoggedUser, setAuth } from 'store/app-reducer'
import { AuthService } from 'api/rest/services'
import { getServerAuthToken } from 'config'
import initializeSocketIO from 'api/socket'
import { initAxiosInstance } from 'api/rest/axios'
import "./styles.scss"

/**
 * Splash screen to show until the authentication is verified
 */
export default function SplashScreenPage(props) {

  const { onClose } = props

  const dispatch = useDispatch();

  useEffect(() => {
    const serverAuthToken = getServerAuthToken()
    if (serverAuthToken && serverAuthToken.trim() !== "") {
      // verify auth after mount
      AuthService.verifyToken(serverAuthToken).then(isValid => {
        initAxiosInstance()
        initializeSocketIO()
        dispatch(setAuth({ isAuthenticated: isValid }))
        dispatch(fetchLoggedUser())
        onClose()
      })
    } else {
      onClose()
    }
    // eslint-disable-next-line
  }, [])

  return (
    <section id="splash-screen-page">
      <CircularProgress />
    </section>
  )
}