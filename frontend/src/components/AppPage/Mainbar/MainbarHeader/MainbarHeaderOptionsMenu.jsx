import { memo, useState } from "react"
import LockIcon from '@mui/icons-material/LockOutlined';
// import LockOpenIcon from '@mui/icons-material/LockOpenOutlined';
import SelectIcon from '@mui/icons-material/CheckCircleOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import NotificationsOffIcon from "@mui/icons-material/NotificationsOffOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover"
import { useDispatch, useSelector } from "react-redux"
import { MessagesReducerActions } from "store/messages-reducer"
import AlertDialog from "components/dialogs/AlertDialog";
import useAppTheme from "hooks/useAppTheme";
import { useNavigate, useParams } from "react-router-dom";
import { ChatsReducerThunks } from "store/chats-reducer";


function MainbarHeaderOptionsMenu(props) {

    const { open, anchorEl, onClose, parsedChat } = props
    const { isChatCreated, chatId, chatType, targetId, chatName, isMuted } = parsedChat

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()
    const { theme } = useAppTheme()
    const isSelectionModeOn = useSelector(rootState => rootState.messages.isSelectionModeOn)
    const [alertDialogOpen, setAlertDialogOpen] = useState(false)

    const onSelectOptionClicked = () => {
        onClose()
        if (isSelectionModeOn)
            dispatch(MessagesReducerActions.turnOffSelectionMode())
        else
            dispatch(MessagesReducerActions.turnOnSelectionMode())
    }

    const alertDialogOptions = [
        { name: "Cancel", variant: "primary", handler: () => setAlertDialogOpen(false) },
        {
            name: "Delete Chat", variant: "danger", handler: () => {
                dispatch(ChatsReducerThunks.deleteChat({ chatId, targetUserId: targetId }))
                if (params.targetId === targetId)
                    navigate("/app", { replace: true })
            }
        },
        {
            name: "Leave Group", variant: "danger", handler: () => {
                dispatch(ChatsReducerThunks.leaveGroup({ chatId, groupId: targetId }))
                if (params.targetId === targetId)
                    navigate("/app", { replace: true })
            }
        },
        {
            name: "Leave Channel", variant: "danger", handler: () => {
                dispatch(ChatsReducerThunks.leaveChannel({ chatId, channelId: targetId }))
                if (params.targetId === targetId)
                    navigate("/app", { replace: true })
            }
        }
    ]

    return (
        <>
            <Popover open={open} onClose={onClose} onClick={onClose}
                id="mainbar-header-options-menu" className={`theme-${theme}`} anchorEl={anchorEl}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>

                {isChatCreated ? (
                    <>
                        {isMuted ? (
                            <MenuItem className={`theme-${theme}`}
                                onClick={() => dispatch(ChatsReducerThunks.setChatFlag({ chatId, flagToBeModified: "mute", value: false }))}>
                                <NotificationsIcon />
                                <span className="menu-item__text">Unmute</span>
                            </MenuItem>
                        ) : (
                            <MenuItem className={`theme-${theme}`}
                                onClick={() => dispatch(ChatsReducerThunks.setChatFlag({ chatId, flagToBeModified: "mute", value: true }))}>
                                <NotificationsOffIcon />
                                <span className="menu-item__text">Mute</span>
                            </MenuItem>
                        )}
                    </>
                ) : null}

                <MenuItem className={`theme-${theme}`} onClick={onSelectOptionClicked}>
                    <SelectIcon />
                    <span className="menu-item__text">{isSelectionModeOn ? "Deselect Messages" : "Select messages"}</span>
                </MenuItem>

                {chatType === "private" ? (
                    <MenuItem className={`theme-${theme}`}>
                        <LockIcon />
                        <span className="menu-item__text">Block user</span>
                    </MenuItem>
                ) : null}

                {isChatCreated ? (
                    <>
                        {chatType === "private" ? (
                            <MenuItem className={`theme-${theme} item-red`} onClick={() => setAlertDialogOpen(true)}>
                                <DeleteIcon />
                                <span className="menu-item__text">Delete chat</span>
                            </MenuItem>
                        ) : null}

                        {chatType === "group" ? (
                            <MenuItem className={`theme-${theme} item-red`} onClick={() => setAlertDialogOpen(true)}>
                                <DeleteIcon />
                                <span className="menu-item__text">Leave Group</span>
                            </MenuItem>
                        ) : null}

                        {chatType === "channel" ? (
                            <MenuItem className={`theme-${theme} item-red`} onClick={() => setAlertDialogOpen(true)}>
                                <DeleteIcon />
                                <span className="menu-item__text">Leave Channel</span>
                            </MenuItem>
                        ) : null}
                    </>
                ) : null}
            </Popover>

            {/* Alert Dialogs for Delete clicked actions */}
            {isChatCreated ? (
                <>
                    {chatType === "private" ? (
                        <AlertDialog open={alertDialogOpen} title="Delete Chat" message={`Are you sure you want to delete ${chatName}`}
                            actions={[alertDialogOptions[0], alertDialogOptions[1]]} />
                    ) : null}

                    {chatType === "group" ? (
                        <AlertDialog open={alertDialogOpen} title="Leave Group" message={`Are you sure you want to delete and leave the group ${chatName}`}
                            actions={[alertDialogOptions[0], alertDialogOptions[2]]} />
                    ) : null}

                    {chatType === "channel" ? (
                        <AlertDialog open={alertDialogOpen} title="Leave Channel" message={`Are you sure you want to delete and leave the channel ${chatName}`}
                            actions={[alertDialogOptions[0], alertDialogOptions[3]]} />
                    ) : null}
                </>
            ) : null}
        </>
    )
}

export default memo(MainbarHeaderOptionsMenu)