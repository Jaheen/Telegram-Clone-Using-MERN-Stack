import MarkChatReadIcon from '@mui/icons-material/MarkChatReadOutlined';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnreadOutlined';
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOffOutlined';
import ArchiveIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveIcon from '@mui/icons-material/UnarchiveOutlined';
import PushPinIcon from '@mui/icons-material/PushPinOutlined';
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import AlertDialog from 'components/dialogs/AlertDialog';
import { useNavigate, useParams } from 'react-router-dom';
import useAppTheme from 'hooks/useAppTheme';
import { useDispatch } from 'react-redux';
import { ChatsReducerThunks } from 'store/chats-reducer';


/**
 * Context menu to show when a chat item is right clicked
 */
export default function ChatItemContextMenu(props) {

    const { open, onClose, anchorPosition, chat } = props
    const { chatId, targetId, chatName, chatType, isPinned, isArchived, isMuted, hasUnreadMessages } = chat

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()
    const { theme } = useAppTheme()
    const [alertDialogOpen, setAlertDialogOpen] = useState(false)

    const alertDialogOptions = [
        { name: "Cancel", variant: "primary", handler: () => setAlertDialogOpen(false) },
        {
            name: "Delete Chat", variant: "danger", handler: () => {
                dispatch(ChatsReducerThunks.deleteChat({ chatId, taregtUserId: targetId }))
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
            <Popover className={`chat-item__context-menu theme-${theme}`}
                open={open} anchorReference="anchorPosition"
                anchorPosition={anchorPosition}
                anchorOrigin={{ horizontal: "center", vertical: "center" }}
                onClose={onClose} onClick={onClose}>

                {hasUnreadMessages ? (
                    <MenuItem className={`theme-${theme}`}>
                        <MarkChatReadIcon />
                        <span className="menu-item__text">Mark as read</span>
                    </MenuItem>
                ) : (
                    <MenuItem className={`theme-${theme}`}>
                        <MarkChatUnreadIcon />
                        <span className="menu-item__text">Mark as unread</span>
                    </MenuItem>
                )}

                {isPinned ? (
                    <MenuItem className={`theme-${theme}`}
                        onClick={() => dispatch(ChatsReducerThunks.setChatFlag({ chatId, flagToBeModified: "pin", value: false }))}>
                        <PushPinIcon />
                        <span className="menu-item__text">Unpin</span>
                    </MenuItem>
                ) : (
                    <MenuItem className={`theme-${theme}`}
                        onClick={() => dispatch(ChatsReducerThunks.setChatFlag({ chatId, flagToBeModified: "pin", value: true }))}>
                        <PushPinIcon />
                        <span className="menu-item__text">Pin</span>
                    </MenuItem>
                )}

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

                {isArchived ? (
                    <MenuItem className={`theme-${theme}`}
                        onClick={() => dispatch(ChatsReducerThunks.setChatFlag({ chatId, flagToBeModified: "archive", value: false }))}>
                        <UnarchiveIcon />
                        <span className="menu-item__text">Unarchive</span>
                    </MenuItem>
                ) : (
                    <MenuItem className={`theme-${theme}`}
                        onClick={() => dispatch(ChatsReducerThunks.setChatFlag({ chatId, flagToBeModified: "archive", value: true }))}>
                        <ArchiveIcon />
                        <span className="menu-item__text">Archive</span>
                    </MenuItem>
                )}

                {chatType === "private" ? (
                    <MenuItem className={`theme-${theme} item-red`} onClick={() => setAlertDialogOpen(true)}>
                        <DeleteIcon />
                        <span className="menu-item__text">Delete Chat</span>
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

            </Popover>

            {/* Alert Dialogs for Delete clicked actions */}
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
    )
}