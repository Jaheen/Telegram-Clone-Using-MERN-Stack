import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneIcon from "@mui/icons-material/Done";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer"
import Fab from "@mui/material/Fab"
import AvatarPicker from "components/common/AvatarPicker";
import useAppTheme from "hooks/useAppTheme";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import useBackStack from "hooks/useBackStack";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ChatsReducerThunks } from "store/chats-reducer";
import "./styles.scss"


export default function EditChannelDrawer(props) {

    const { open, onClose, targetChannel } = props

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { theme } = useAppTheme()
    const backstack = useBackStack()
    const [channelInfo, setChannelInfo] = useState({
        channelName: targetChannel.channelName,
        channelDescription: targetChannel.channelDescription,
        avatarUrl: targetChannel.avatarUrl
    })

    useEffect(() => {
        if (open) {
            backstack.push("edit-channel-drawer", () => onClose())
        }

        // eslint-disable-next-line
    }, [open])

    /**
     * Check if channel data is changed or not
     */
    const isDataChanged = (() => {
        let isChanged = false
        const fieldsToCheck = ["channelName", "channelDescription", "avatarUrl"]

        fieldsToCheck.forEach(fieldName => {
            if (targetChannel[fieldName])
                isChanged = isChanged || targetChannel[fieldName] !== channelInfo[fieldName]
            else
                isChanged = isChanged || channelInfo[fieldName] !== ""
        })

        isChanged = isChanged && channelInfo.channelName.trim() !== ""

        return isChanged
    })()

    const fabClass = isDataChanged ? "slide-up" : null
    const { channelName, channelDescription, avatarUrl } = channelInfo

    return (
        <Drawer id="edit-channel-drawer" className={`mainbar-drawer theme-${theme}`} open={open} onClose={() => navigate(-1)} anchor="right">
            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <h1 className="header__title">Edit Channel</h1>
            </div>
            
            <div className="scrollable-content">
                <AvatarPicker avatarUrl={avatarUrl} avatarText={channelName.substring(0, 1)}
                    targetFolder="channels" onChange={(avatarUrl) => setChannelInfo({ ...channelInfo, avatarUrl })} />

                <TextField className={`form-field theme-${theme}`} label="Group Name"
                    value={channelName} onChange={(ev) => setChannelInfo({ ...channelInfo, channelName: ev.target.value })} />

                <TextField className={`form-field theme-${theme}`} multiline maxRows={4} label="Group Description (optional)"
                    value={channelDescription} onChange={(ev) => setChannelInfo({ ...channelInfo, channelDescription: ev.target.value })} />
            </div>

            <Fab className={`fab-bottom-right ${fabClass} theme-${theme}`}
                onClick={() => dispatch(ChatsReducerThunks.updateChannelProfile({ channelName, channelDescription, avatarUrl }))}>
                <DoneIcon />
            </Fab>
        </Drawer>
    )
}