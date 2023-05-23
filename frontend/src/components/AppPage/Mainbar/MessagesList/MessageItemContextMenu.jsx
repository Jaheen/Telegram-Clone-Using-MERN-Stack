import ReplyIcon from '@mui/icons-material/ReplyOutlined'
import CopyIcon from '@mui/icons-material/CopyAllOutlined'
import ForwardIcon from '@mui/icons-material/ForwardOutlined'
import SelectIcon from '@mui/icons-material/CheckCircleOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import Popover from '@mui/material/Popover'
import MenuItem from '@mui/material/MenuItem'
import useAppTheme from 'hooks/useAppTheme'
import { useDispatch, useSelector } from 'react-redux'
import { MessagesReducerActions, MessagesReducerThunks } from 'store/messages-reducer'
import AlertDialog from 'components/dialogs/AlertDialog'
import { useState } from 'react'
import { shouldRenderDeleteButton } from './helper'
import { useParams } from 'react-router-dom'

/**
 * Right click context menu for the Message Item component
 */
export default function MessageItemContextMenu(props) {

    const { open, onClose, anchorPosition, message } = props

    const dispatch = useDispatch()
    const params = useParams()
    const { theme } = useAppTheme()
    const activeChat = useSelector(rootState => rootState.chats.activeChat)
    const loggedUser = useSelector(rootState => rootState.app.loggedUser)
    const isSelectionModeOn = useSelector(rootState => rootState.messages.isSelectionModeOn)
    const selectedMessages = useSelector(rootState => rootState.messages.messages.filter(message => message.isSelected))
    const [deleteDialog, setDeleteDialog] = useState({ open: false, title: "", message: "" })

    const copyMessage = () => {
        if (isSelectionModeOn) {
            let data = ""
            selectedMessages.reverse().forEach(selectedMessage => {
                if (selectedMessage.contentType === "TEXT") {
                    data += selectedMessage.content + "\n"
                }
            })
            navigator.clipboard.writeText(data)
        } else {
            if (message.contentType === "TEXT") {
                navigator.clipboard.writeText(message.content)
            }
        }
    }

    const selectMessageClickHandler = () => {
        if (message && message.isSelected) dispatch(MessagesReducerActions.deselectMessage(message.messageId))
        else dispatch(MessagesReducerActions.selectMessage(message.messageId))
    }

    const deleteMessage = () => {
        setDeleteDialog({ ...deleteDialog, open: false })
        dispatch(MessagesReducerActions.turnOffSelectionMode())
        if (isSelectionModeOn) {
            const selectedMessageIds = selectedMessages.map(message => message.messageId)
            dispatch(MessagesReducerThunks.deleteMessages({ chatType: params.chatType, targetId: params.targetId, messageIds: selectedMessageIds }))
        } else {
            dispatch(MessagesReducerThunks.deleteMessages({ chatType: params.chatType, targetId: params.targetId, messageIds: [message.messageId] }))
        }
    }

    const deleteMessageClickHandler = () => {
        setDeleteDialog({
            open: true,
            title: isSelectionModeOn ? "Delete Messages" : "Delete Message",
            message: `Are you sure you want to delete the ${isSelectionModeOn ? "selected messages" : "message"}`
        })
    }

    // Dynamic variables for rendering content
    const deleteDialogActions = [
        { name: isSelectionModeOn ? "Delete Selected" : "Delete Message", variant: "danger", handler: deleteMessage },
        { name: "Cancel", variant: "primary", handler: () => setDeleteDialog({ ...deleteDialog, open: false }) }
    ]
    const canDelete = shouldRenderDeleteButton(activeChat, loggedUser, message, isSelectionModeOn, selectedMessages)
    const canCopy = (message && message.contentType === "TEXT") || isSelectionModeOn

    return (
        <>
            <Popover open={open} className={`theme-${theme}`}
                onClose={onClose} anchorReference="anchorPosition"
                anchorPosition={anchorPosition} onClick={onClose}>

                {!isSelectionModeOn && message && message.senderId !== loggedUser.userId ? (
                    <MenuItem className={`menu-item theme-${theme}`}>
                        <ReplyIcon />
                        <span className="menu-item__text">Reply</span>
                    </MenuItem>
                ) : null}

                {canCopy ? (
                    <MenuItem className={`menu-item theme-${theme}`} onClick={copyMessage}>
                        <CopyIcon />
                        <span className="menu-item__text">{isSelectionModeOn ? "Copy Selected" : "Copy message"}</span>
                    </MenuItem>
                ) : null}

                <MenuItem className={`menu-item theme-${theme}`}>
                    <ForwardIcon />
                    <span className="menu-item__text">{isSelectionModeOn ? "Forward Selected" : "Forward message"}</span>
                </MenuItem>

                <MenuItem className={`menu-item theme-${theme}`} onClick={selectMessageClickHandler}>
                    <SelectIcon />
                    <span className="menu-item__text">{message && message.isSelected ? "Clear selection" : "Select message"}</span>
                </MenuItem>

                {canDelete ? (
                    <MenuItem className={`menu-item theme-${theme} item-red`} onClick={deleteMessageClickHandler}>
                        <DeleteIcon />
                        <span className="menu-item__text">{isSelectionModeOn ? "Delete selected" : "Delete message"}</span>
                    </MenuItem>
                ) : null}
            </Popover>

            <AlertDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
                title={deleteDialog.title} message={deleteDialog.message} actions={deleteDialogActions} />
        </>
    )
}