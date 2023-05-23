import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import AlertDialog from "../AlertDialog";
import { useEffect, useState } from "react";
import Patterns from "utils/regex/patterns";
import useAppTheme from "hooks/useAppTheme";
import { ContactsService } from "api/socket/services";
import "./styles.scss"


export default function CreateContactDialog(props) {

    const { open, onClose } = props

    const { theme } = useAppTheme()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [alertDialog, setAlertDialog] = useState({ open: false, message: "" })

    const alertActions = [
        {
            name: "Ok",
            variant: "primary",
            handler: () => setAlertDialog({ ...alertDialog, open: false })
        }
    ]

    /**
     * validate data and make api request to create contact
     */
    const addBtnClicked = () => {
        if (firstName.trim() !== "") {
            if (phoneNumber.trim() !== "") {
                if (Patterns.phoneNumbers.in.test(`+91${phoneNumber}`)) {
                    ContactsService.createContact(firstName, lastName, `+91${phoneNumber}`).then(onClose).catch(message => {
                        switch (message) {
                            case "phone-number-not-exists":
                                setAlertDialog({ open: true, message: "Phone number you entered is not registered" })
                                break
                            case "number-belongs-to-you":
                                setAlertDialog({ open: true, message: "You cannot add your number as a contact" })
                                break
                            case "contact-already-exists":
                                setAlertDialog({ open: true, message: "A contact with the same phone number already exists" })
                                break
                            default:
                                console.log(message)
                        }
                    })

                } else
                    setAlertDialog({ open: true, message: "Please enter a valid 10 digit Indian Mobile number" })
            } else
                setAlertDialog({ open: true, message: "Phone number can't be empty" })
        } else
            setAlertDialog({ open: true, message: "First name can't be empty" })
    }

    useEffect(() => {
        setFirstName("")
        setLastName("")
        setPhoneNumber("")
    }, [open])

    return (
        <Dialog open={open} id="create-contact-dialog" className={`theme-${theme}`}>
            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
                <h2 className="header__title">Add Contact</h2>
                <Button id="add-contact-btn" variant="contained" disableElevation onClick={addBtnClicked}>Add</Button>
            </div>
            <div className="content">
                <Grid container spacing={1}>
                    <Grid item xs={4} container alignItems="center" justify="center">
                        <div className="avatar-placeholder">
                            {firstName.substring(0, 1) + lastName.substring(0, 1)}
                        </div>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField fullWidth className={`dialog-input-field theme-${theme}`} label="First name"
                            value={firstName} onChange={ev => setFirstName(ev.target.value)} />
                        <TextField fullWidth className={`dialog-input-field theme-${theme}`} label="Last name (optional)"
                            value={lastName} onChange={ev => setLastName(ev.target.value)} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth className={`dialog-input-field theme-${theme}`} label="Phone number"
                            value={phoneNumber} onChange={ev => setPhoneNumber(ev.target.value)} />
                    </Grid>
                </Grid>
            </div>

            <AlertDialog open={alertDialog.open} title="Error" message={alertDialog.message} actions={alertActions} />
        </Dialog>
    )
}