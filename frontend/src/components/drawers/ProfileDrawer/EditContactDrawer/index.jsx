import Fab from "@mui/material/Fab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import DoneIcon from "@mui/icons-material/Done";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Drawer from "@mui/material/Drawer"
import { useEffect, useState } from "react";
import DrawerMenuItem from "components/common/DrawerMenuItem";
import AlertDialog from "components/dialogs/AlertDialog";
import { ContactsService } from "api/socket/services";
import Profile from "components/common/Profile";
import useAppTheme from "hooks/useAppTheme";
import useBackStack from "hooks/useBackStack";
import { useNavigate } from "react-router-dom";
import "./styles.scss"


export default function EditContactDrawer(props) {

    const { open, onClose, profile, contact } = props

    const navigate = useNavigate()
    const { theme } = useAppTheme()
    const backstack = useBackStack()
    const [alertDialogOpen, toggleAlertDialog] = useState(false)
    const [contactData, setContactData] = useState({
        firstName: "",
        lastName: ""
    })

    const isDataChanged = () => {
        let isChanged = false
        const fieldsToCheck = ["firstName", "lastName"]

        fieldsToCheck.forEach(fieldName => {
            if (contact[fieldName])
                isChanged = isChanged || contact[fieldName] !== contactData[fieldName]
            else
                isChanged = isChanged || contactData[fieldName] !== ""
        })

        isChanged = isChanged && contactData.firstName.trim() !== ""

        return isChanged
    }

    const setFirstName = (ev) => setContactData({ ...contactData, firstName: ev.target.value })
    const setLastName = (ev) => setContactData({ ...contactData, lastName: ev.target.value })

    const onDoneClicked = () => ContactsService.updateContact(contact.contactId, contactData.firstName, contactData.lastName)

    useEffect(() => {
        setContactData({
            firstName: contact.firstName,
            lastName: contact.lastName
        })
    }, [contact, open])

    useEffect(() => {
        if (open) {
            backstack.push("edit-contact-drawer", () => onClose())
        }
        // eslint-disable-next-line
    }, [open])

    const fabClass = isDataChanged() ? "slide-up" : null
    const alertDialogActions = [
        { name: "Cancel", variant: "primary", handler: () => toggleAlertDialog(false) },
        {
            name: "Delete Contact",
            variant: "danger",
            handler: () => ContactsService.deleteContact(contact.contactId)
        }
    ]

    return (
        <Drawer id="edit-contact-drawer" className={`mainbar-drawer theme-${theme}`} open={open} onClose={() => navigate(-1)} anchor="right">
            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <h1 className="header__title">Edit Contact</h1>
            </div>
            <div className="scrollable-content">
                <Profile variant="banner"
                    profileName={profile.profileName}
                    profileMeta="Original name"
                    avatarUrl={profile.avatarUrl}
                    avatarText={profile.avatarText} />

                <TextField value={contactData.firstName} onChange={setFirstName}
                    className={`form-field theme-${theme}`} label="First name (required)" />
                <TextField value={contactData.lastName} onChange={setLastName}
                    className={`form-field theme-${theme}`} label="Last name (optional)" />

                <div className="delete-button-container">
                    <DrawerMenuItem danger startAdornment={<DeleteIcon />} title="Delete Contact" onClick={() => toggleAlertDialog(true)} />
                </div>

                <Fab className={`fab-bottom-right ${fabClass} theme-${theme}`} onClick={onDoneClicked}>
                    <DoneIcon />
                </Fab>
            </div>

            <AlertDialog open={alertDialogOpen} title="Delete Contact" message={`Are you sure you want to delete ${profile.profileName}'s contact?`}
                actions={alertDialogActions} />
        </Drawer>
    )
}