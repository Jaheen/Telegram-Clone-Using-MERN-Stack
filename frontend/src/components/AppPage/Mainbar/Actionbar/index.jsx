import IconButton from "@mui/material/IconButton";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { memo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import useAppTheme from "hooks/useAppTheme";
import { MessagesReducerThunks } from "store/messages-reducer";
import MessageSelectionOverlay from "./MessageSelectionOverlay";
import { MediaUploadDialog } from "components/dialogs";
import "./styles.scss"


/**
 * Actionbar
 */
function Actionbar() {

    const dispatch = useDispatch()
    const attachmentButtonRef = useRef(null)
    const { theme } = useAppTheme()
    const [mediaUploadDialogOpen, setMediaUploadDialogOpen] = useState(false)

    /**
     * When message box is typed handle listener
     * @param {React.KeyboardEvent} ev message box type event
     */
    const onMessageBoxKeyPress = ev => {
        if (ev.key === "Enter") {
            if (ev.target.value.trim() !== "") {
                dispatch(MessagesReducerThunks.sendMessage({ contentType: "TEXT", content: ev.target.value }))
                ev.target.value = ""
            }
        }
    }

    return (
        <>
            <div id="action-bar" className={`theme-${theme}`}>

                <div className="action-box-container">

                    <div className="action-box">

                        <input type="text" className="message-box" placeholder="Message" onKeyDown={onMessageBoxKeyPress} />

                        <IconButton id="attach-button" ref={attachmentButtonRef} className={`theme-${theme}`} onClick={() => setMediaUploadDialogOpen(true)}>
                            <AttachFileIcon />
                        </IconButton>
                    </div>

                    <MessageSelectionOverlay />
                </div>

            </div>

            <MediaUploadDialog open={mediaUploadDialogOpen} onClose={() => setMediaUploadDialogOpen(false)} onProceed={console.log} />
        </>
    )
}

export default memo(Actionbar)