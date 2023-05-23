import Button from "@mui/material/Button";
import ForwardIcon from "@mui/icons-material/ReplyOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';
import useAppTheme from "hooks/useAppTheme"
import { useDispatch, useSelector } from "react-redux";
import { MessagesReducerActions, MessagesReducerThunks } from "store/messages-reducer";
import { shouldRenderDeleteButton } from "./helper";
import AlertDialog from "components/dialogs/AlertDialog";
import { useState } from "react";
import { useParams } from "react-router-dom";
import "./styles.scss"
import ForwardDialog from "components/dialogs/ForwardDialog";


export default function MessageSelectionOverlay() {

    const dispatch = useDispatch()
    const params = useParams()
    const { theme } = useAppTheme()
    const loggedUser = useSelector(rootState => rootState.app.loggedUser)
    const activeChat = useSelector(rootState => rootState.chats.activeChat)
    const isSelectionModeOn = useSelector(rootState => rootState.messages.isSelectionModeOn)
    const selectedMessagesCount = useSelector(rootState => rootState.messages.selectedMessagesCount)
    const selectedMessages = useSelector(rootState => rootState.messages.messages.filter(message => message.isSelected))
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [forwardDialogOpen, setForwardDialogOpen] = useState(false)

    /**
     * Close delete dialog and dispatch thunk to delete selected messages
     */
    const deleteMessage = () => {
        if (selectedMessagesCount !== 0) {
            setDeleteDialogOpen(false)
            dispatch(MessagesReducerActions.turnOffSelectionMode())
            const selectedMessageIds = selectedMessages.map(message => message.messageId)
            dispatch(MessagesReducerThunks.deleteMessages({ chatType: params.chatType, targetId: params.targetId, messageIds: selectedMessageIds }))
        }
    }

    // Dynamic vars for rendering content
    const deleteDialogActions = [
        { name: isSelectionModeOn ? "Delete Selected" : "Delete Message", variant: "danger", handler: deleteMessage },
        { name: "Cancel", variant: "primary", handler: () => setDeleteDialogOpen(false) }
    ]
    const activeClass = isSelectionModeOn ? "active" : "inactive"
    const canDelete = shouldRenderDeleteButton(activeChat, loggedUser, selectedMessages)

    return (
        <div id="message-selection-overlay" className={`theme-${theme} ${activeClass}`}>
            <IconButton className={`theme-${theme}`} onClick={() => dispatch(MessagesReducerActions.turnOffSelectionMode())}>
                <CloseIcon />
            </IconButton>

            <span className="selection-count">
                {selectedMessagesCount} {selectedMessagesCount > 1 ? "Messages" : "Message"}
            </span>

            <Button id="forward-button" onClick={() => setForwardDialogOpen(true)}><ForwardIcon />Forward</Button>
            {canDelete ? (
                <Button id="delete-button" onClick={() => setDeleteDialogOpen(true)}><DeleteIcon />Delete</Button>
            ) : null}

            <AlertDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}
                title="Delete Messages" message="Are you sure you want to delete the selected messages" actions={deleteDialogActions} />

            <ForwardDialog open={forwardDialogOpen} onClose={() => setForwardDialogOpen(false)} />
        </div>
    )
}