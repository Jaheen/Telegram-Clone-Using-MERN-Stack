import PollIcon from '@mui/icons-material/PollOutlined'
import MenuItem from "@mui/material/MenuItem"
import Popover from "@mui/material/Popover"
import { MediaUploadDialog } from 'components/dialogs'
import AudioUploadDialog from 'components/dialogs/AudioUploadDialog'
import CreatePollDialog from 'components/dialogs/CreatePollDialog'
import FileUploadDialog from 'components/dialogs/FileUploadDialog'
import ImageUploadDialog from 'components/dialogs/ImageUploadDialog'
import VideoUploadDialog from 'components/dialogs/VideoUploadDialog'
import useAppTheme from "hooks/useAppTheme"
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { MessagesReducerThunks } from 'store/messages-reducer'

export default function ActionbarAttachmentMenu(props) {

    const { open, anchorEl, onClose } = props

    const dispatch = useDispatch()
    const { theme } = useAppTheme()
    const [imageUploadDialogOpen, toggleImageUploadDialog] = useState(false)
    const [videoUploadDialogOpen, toggleVideoUploadDialog] = useState(false)
    const [audioUploadDialogOpen, toggleAudioUploadDialog] = useState(false)
    const [fileUploadDialogOpen, toggleFileUploadDialog] = useState(false)
    const [mediaUploadDialogOpen, setMediaUploadDialogOpen] = useState(false)
    const [pollDialogOpen, togglePollDialog] = useState(false)

    const openImageUploadDialog = () => toggleImageUploadDialog(true)
    const closeImageUploadDialog = () => toggleImageUploadDialog(false)
    const openVideoUploadDialog = () => toggleVideoUploadDialog(true)
    const closeVideoUploadDialog = () => toggleVideoUploadDialog(false)
    const openAudioUploadDialog = () => toggleAudioUploadDialog(true)
    const closeAudioUploadDialog = () => toggleAudioUploadDialog(false)
    const openFileUploadDialog = () => toggleFileUploadDialog(true)
    const closeFileUploadDialog = () => toggleFileUploadDialog(false)
    const openCreatePollDialog = () => togglePollDialog(true)
    const closeCreatePollDialog = () => togglePollDialog(false)

    /**
     * Send Image Message after image uploaded to firebase
     * @param {string} imageUrl public access url of the image uploaded to the firebase storage
     * @param {string} caption caption for the image content
     */
    const sendImageMessage = (imageUrl, caption) => {
        closeImageUploadDialog()
        dispatch(MessagesReducerThunks.sendMessage({
            contentType: "IMAGE",
            content: { imageUrl, caption }
        }))
    }

    /**
     * Send Video Message after video uploaded to firebase
     * @param {string} videoUrl public access url of the video uploaded to user
     * @param {string} caption caption for the video content
     */
    const sendVideoMessage = (videoUrl, caption) => {
        closeVideoUploadDialog()
        dispatch(MessagesReducerThunks.sendMessage({
            contentType: "VIDEO",
            content: { videoUrl, caption }
        }))
    }

    /**
     * Send Audio Message after audio upload to firebase
     * @param {string} audioUrl public access url of the video uploaded to user
     * @param {string} caption caption for the audio content
     */
    const sendAudioMessage = (audioUrl, caption) => {
        closeAudioUploadDialog()
        dispatch(MessagesReducerThunks.sendMessage({
            contentType: "AUDIO",
            content: { audioUrl, caption }
        }))
    }

    /**
     * Send File Message after file uploaded to firebase
     * @param {string} filename name of the uploaded file
     * @param {number} size size of the file in bytes
     * @param {string} type mime type of the file
     * @param {string} fileUrl public access url of the uploaded file
     * @param {string} caption caption for the file content
     */
    const sendFileMessage = (filename, size, type, fileUrl, caption) => {
        closeFileUploadDialog()
        dispatch(MessagesReducerThunks.sendMessage({
            contentType: "FILE",
            content: { filename, size, type, fileUrl, caption }
        }))
    }

    /**
     * Send a poll to all members or subscribers
     * @param {string} question Question of the poll
     * @param {Array<string>} options options of the poll
     * @param {object} settings object containing settings with boolean values
     */
    const sendPollMessage = (question, options, settings) => {
        closeCreatePollDialog()
        dispatch(MessagesReducerThunks.sendMessage({
            contentType: "POLL",
            content: { question, options, settings }
        }))
    }

    return (
        <>
            <Popover id="action-bar-attachment-menu" className={`theme-${theme}`}
                open={open} onClose={onClose} onClick={onClose} anchorEl={anchorEl}
                anchorOrigin={{ horizontal: "right", vertical: "top" }}
                transformOrigin={{ horizontal: "right", vertical: "bottom" }}>

                <MenuItem className={`theme-${theme}`} onClick={openImageUploadDialog}>
                    <PollIcon />
                    <p className="menu-item__text">Photo</p>
                </MenuItem>

                <MenuItem className={`theme-${theme}`} onClick={openVideoUploadDialog}>
                    <PollIcon />
                    <p className="menu-item__text">Video</p>
                </MenuItem>

                <MenuItem className={`theme-${theme}`} onClick={openAudioUploadDialog}>
                    <PollIcon />
                    <p className="menu-item__text">Audio</p>
                </MenuItem>

                <MenuItem className={`theme-${theme}`} onClick={openFileUploadDialog}>
                    <PollIcon />
                    <p className="menu-item__text">File</p>
                </MenuItem>

                <MenuItem className={`theme-${theme}`} onClick={() => setMediaUploadDialogOpen(true)}>
                    <PollIcon />
                    <p className="menu-item__text">Media</p>
                </MenuItem>

                {/* {activeChat.chatType !== "private" ? ( */}
                <MenuItem className={`theme-${theme}`} onClick={openCreatePollDialog}>
                    <PollIcon />
                    <p className="menu-item__text">Poll</p>
                </MenuItem>
                {/* ) : null} */}

            </Popover>

            {/* <ImageUploadDialog open={imageUploadDialogOpen} onClose={closeImageUploadDialog} onProceed={sendImageMessage} />
            <VideoUploadDialog open={videoUploadDialogOpen} onClose={closeVideoUploadDialog} onProceed={sendVideoMessage} />
            <AudioUploadDialog open={audioUploadDialogOpen} onClose={closeAudioUploadDialog} onProceed={sendAudioMessage} />
            <FileUploadDialog open={fileUploadDialogOpen} onClose={closeFileUploadDialog} onProceed={sendFileMessage} />
            <CreatePollDialog open={pollDialogOpen} onClose={closeCreatePollDialog} onProceed={sendPollMessage} /> */}
            <MediaUploadDialog open={mediaUploadDialogOpen} onClose={() => setMediaUploadDialogOpen(false)} onProceed={console.log} />
        </>
    )
}