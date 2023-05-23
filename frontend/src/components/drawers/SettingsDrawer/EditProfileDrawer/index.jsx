import DoneIcon from '@mui/icons-material/Done'
import AvatarPicker from 'components/common/AvatarPicker'
import TextField from '@mui/material/TextField'
import Fab from '@mui/material/Fab'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import { memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateLoggedUser } from 'store/app-reducer'
import useAppTheme from 'hooks/useAppTheme'
import useBackStack from 'hooks/useBackStack'
import { useNavigate } from 'react-router-dom'
import "./styles.scss"


function EditProfileDrawer(props) {

    const { open, onClose } = props

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { theme } = useAppTheme()
    const backstack = useBackStack()
    const loggedUser = useSelector(rootState => rootState.app.loggedUser)
    const [profileData, setProfileData] = useState({ firstName: "", lastName: "", bio: "", username: "", avatarUrl: "", avatarText: "" })

    useEffect(() => {
        const { firstName, lastName, bio, username, avatarUrl } = loggedUser
        let avatarText

        if (Boolean(firstName))
            avatarText = firstName.substring(0, 1)
        if (Boolean(lastName))
            avatarText += lastName.substring(0, 1)

        setProfileData({
            firstName: firstName ? firstName : "",
            lastName: lastName ? lastName : "",
            bio: bio ? bio : "",
            username: username ? username : "",
            avatarUrl: avatarUrl,
            avatarText
        })
    }, [loggedUser, open])

    /**
     * use effect for adding entry and callback to history stack if opened
     */
    useEffect(() => {
        if (open) {
            backstack.push("edit-profile-drawer", () => onClose())
        }
        // eslint-disable-next-line
    }, [open])

    const isDataChanged = (() => {
        let isChanged = false
        const fieldsToCheck = ["firstName", "lastName", "bio", "username", "avatarUrl"]

        fieldsToCheck.forEach(fieldName => {
            if (loggedUser[fieldName])
                isChanged = isChanged || loggedUser[fieldName] !== profileData[fieldName]
            else
                isChanged = isChanged || profileData[fieldName] !== ""
        })

        isChanged = isChanged && profileData.firstName.trim() !== ""

        return isChanged
    })()
    const openClass = open ? "open" : "close"
    const fabClass = isDataChanged ? "slide-up" : null

    return (
        <section id="edit-profile-drawer" className={`sidebar-drawer ${openClass} theme-${theme}`}>
            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <h1 className="header__title">Edit Profile</h1>
            </div>
            <div className="scrollable-content">
                <div className="form-field avatar-field">
                    <AvatarPicker avatarUrl={profileData.avatarUrl} avatarText={profileData.avatarText} targetFolder="users"
                        onChange={(avatarUrl) => setProfileData({ ...profileData, avatarUrl })} />
                </div>

                <TextField className={`form-field theme-${theme}`} label="First name"
                    value={profileData.firstName} onChange={(ev) => setProfileData({ ...profileData, firstName: ev.target.value })} />

                <TextField className={`form-field theme-${theme}`} label="Last name (optional)"
                    value={profileData.lastName} onChange={(ev) => setProfileData({ ...profileData, lastName: ev.target.value })} />

                <TextField className={`form-field theme-${theme}`} multiline maxRows={3} label="Bio (optional)"
                    value={profileData.bio} onChange={(ev) => setProfileData({ ...profileData, bio: ev.target.value })} />

                <div className="excerpt">
                    Any details such as occupation or city, <br />
                    Example: 23 y.o designer from San Fransisco
                </div>

                <div className="form-field-title">Username</div>
                <TextField className={`form-field theme-${theme}`} label="Username (optional)"
                    value={profileData.username} onChange={(ev) => setProfileData({ ...profileData, username: ev.target.value })} />

                <div className="excerpt">
                    You can choose a username on Telegram. If you do, people will be able to find you by this username and contact you without needing your phone number.
                </div>

                <div className="excerpt">
                    You can use a-z, 0-9 and underscores. Minimum length is 5 characters.
                </div>
            </div>
            
            <Fab className={`fab-bottom-right ${fabClass} theme-${theme}`} onClick={() => dispatch(updateLoggedUser(profileData))}>
                <DoneIcon />
            </Fab>
        </section>
    )
}

export default memo(EditProfileDrawer)