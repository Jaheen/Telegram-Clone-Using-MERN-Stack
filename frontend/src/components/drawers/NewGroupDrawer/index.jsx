import Fab from "@mui/material/Fab"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import AvatarPicker from 'components/common/AvatarPicker'
import PickContacts from 'components/common/PickContacts'
import ContactItem from "components/common/ContactItem"
import { memo, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DRAWERS, closeDrawer } from 'store/app-reducer'
import { useNavigate } from "react-router-dom"
import { GroupsService } from "api/socket/services"
import useAppTheme from "hooks/useAppTheme"
import useBackStack from "hooks/useBackStack"
import "./styles.scss"


function NewGroupDrawer() {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const rootRef = useRef(null)
    const backstack = useBackStack()
    const { theme } = useAppTheme()
    const newGroupDrawer = useSelector(rootState => rootState.app.drawers[DRAWERS.newGroupDrawer])
    const [groupInfo, setGroupInfo] = useState({ groupName: "", avatarUrl: "" })
    const [selectedContacts, setSelectedContacts] = useState([])

    const contactsSelectedHandler = (contacts) => {
        setSelectedContacts(contacts)
        const root = rootRef.current
        root.scroll({ left: root.scrollWidth / 2, behavior: "smooth" })
    }

    const fabClickHandler = () => {
        const userIds = selectedContacts.map(contact => contact.targetUser.userId)

        GroupsService.createGroup(groupInfo.groupName, groupInfo.avatarUrl, userIds)
            .then(groupChat => navigate(`group/${groupChat.targetId}`))

        navigate(-1)
    }

    /**
     * effect hook to clear state after closing drawer
     */
    useEffect(() => {
        if (newGroupDrawer.open) {
            backstack.push("new-group-drawer", () => dispatch(closeDrawer(DRAWERS.newGroupDrawer)))
        } else {
            setTimeout(() => {
                const root = rootRef.current
                root.scroll({ left: 0 })
                setGroupInfo({ groupName: "", avatarUrl: "" })
            }, 1000);
        }

        // eslint-disable-next-line
    }, [newGroupDrawer.open])

    const openClass = newGroupDrawer.open ? "open" : "close"
    const fabClass = groupInfo.groupName.trim() !== "" ? "slide-up" : null

    return (
        <section id="new-group-drawer" ref={rootRef} className={`sidebar-drawer theme-${theme} ${openClass}`}>

            <div className="pick-contacts-container">
                <PickContacts reset={!newGroupDrawer.open} onBackPressed={() => navigate(-1)} onProceed={contactsSelectedHandler} />
            </div>

            <div className="group-info-container">

                <div className="header">
                    <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <h1 className="header__title">New Group</h1>
                </div>

                <div className="group-info-inputs">
                    <AvatarPicker avatarUrl={groupInfo.avatarUrl}
                        targetFolder="groups" onChange={(avatarUrl) => setGroupInfo({ ...groupInfo, avatarUrl })} />

                    <TextField fullWidth className={`group-name-input theme-${theme}`} label="Group Name"
                        value={groupInfo.groupName} onChange={(ev) => setGroupInfo({ ...groupInfo, groupName: ev.target.value })} />
                </div>

                <div className="selected-contacts">
                    <span className="selected-contacts__count">
                        {selectedContacts.length > 1 ? `${selectedContacts.length} members` : "1 member"}
                    </span>
                    {selectedContacts.map(contact => {
                        return <ContactItem key={contact.contactId} contact={contact} />
                    })}
                </div>

                <Fab id="group-info-fab" className={`fab-bottom-right ${fabClass} theme-${theme}`} onClick={fabClickHandler}>
                    <ArrowForwardIcon />
                </Fab>
            </div>

        </section>
    )
}

export default memo(NewGroupDrawer)