import { useEffect, useRef, useState } from "react"
import Fab from "@mui/material/Fab"
import AvatarPicker from "components/common/AvatarPicker"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import { DRAWERS, closeDrawer } from "store/app-reducer"
import PickContacts from "components/common/PickContacts"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { ChannelsService } from "api/socket/services"
import useBackStack from "hooks/useBackStack"
import useAppTheme from "hooks/useAppTheme"
import "./styles.scss"


function NewChannelDrawer() {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const rootRef = useRef(null)
    const createdChannelRef = useRef(null)
    const backstack = useBackStack()
    const { theme } = useAppTheme()
    const newChannelDrawer = useSelector(rootState => rootState.app.drawers[DRAWERS.newChannelDrawer])
    const [channelInfo, setChannelInfo] = useState({ channelName: "", channelDescription: "", avatarUrl: "" })

    /**
     * After selecting contacts add them as subscribers and close drawer
     * @param {Array<object>} selectedContacts array of selected contacts
     */
    const contactsSelectedHandler = (selectedContacts) => {
        const createdChannel = createdChannelRef.current
        if (createdChannel) {
            const userIds = selectedContacts.map(contact => contact.targetUser.userId)
            ChannelsService.addSubscribers(createdChannel.targetId, userIds)
                .then(_ => navigate(-1))
        }
    }

    /**
     * Create channel with name description and avatarUrl
     */
    const nextFabClickHandler = () => {
        const { channelName, channelDescription, avatarUrl } = channelInfo

        ChannelsService.createChannel(channelName, channelDescription, avatarUrl).then(channelChat => {
            createdChannelRef.current = channelChat
            // navigate(`channel/${channelChat.targetId}`)
        })

        const root = rootRef.current
        root.scroll({ left: root.scrollWidth / 2, behavior: "smooth" })
    }

    /**
     * effect hook to reset state of fields
     */
    useEffect(() => {
        if (newChannelDrawer.open) {
            backstack.push("new-channel-drawer", () => dispatch(closeDrawer(DRAWERS.newChannelDrawer)))
        } else {
            setTimeout(() => {
                const root = rootRef.current
                root.scroll({ left: 0 })
                createdChannelRef.current = null
                setChannelInfo({ channelName: "", channelDescription: "", avatarUrl: "" })
            }, 1000);
        }

        // eslint-disable-next-line
    }, [newChannelDrawer.open])

    const openClass = newChannelDrawer.open ? "open" : "close"
    const fabClass = channelInfo.channelName.trim() !== "" ? "slide-up" : null

    return (
        <section id="new-channel-drawer" ref={rootRef} className={`sidebar-drawer theme-${theme} ${openClass}`}>
            <div className="channel-info-container">

                <div className="header">
                    <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <h1 className="header__title">New Channel</h1>
                </div>

                <div className="channel-info-inputs">
                    <AvatarPicker targetFolder="channels" onChange={(avatarUrl) => setChannelInfo({ ...channelInfo, avatarUrl })} />

                    <TextField value={channelInfo.channelName} onChange={(ev) => setChannelInfo({ ...channelInfo, channelName: ev.target.value })}
                        fullWidth className={`channel-info-input channel-name-input theme-${theme}`} label="Channel Name" />

                    <TextField value={channelInfo.channelDescription} onChange={(ev) => setChannelInfo({ ...channelInfo, channelDescription: ev.target.value })}
                        fullWidth multiline maxRows={3} className={`channel-info-input channel-description-input theme-${theme}`}
                        label="Description (optional)" />
                </div>

                <span className="excerpt">
                    You can provide an optional description for your channel
                </span>

                <Fab id="channel-info-fab" className={`fab-bottom-right ${fabClass} theme-${theme}`} onClick={nextFabClickHandler}>
                    <ArrowForwardIcon />
                </Fab>

            </div>

            <div className="pick-contacts-container">
                <PickContacts reset={!newChannelDrawer.open} onBackPressed={() => navigate(-1)} onProceed={contactsSelectedHandler} />
            </div>
        </section>
    )
}

export default NewChannelDrawer