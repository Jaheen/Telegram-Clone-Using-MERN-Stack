import { memo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { uploadBytesResumable, getStorage, ref, getDownloadURL, deleteObject } from "firebase/storage";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import useAppTheme from "hooks/useAppTheme";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import AudioIcon from "@mui/icons-material/Audiotrack";
import FileIcon from '@mui/icons-material/InsertDriveFile';
import { useDispatch, useSelector } from "react-redux";
import FilePicker from "components/common/FilePicker";
import { MessagesReducerThunks } from "store/messages-reducer";
import "./styles.scss"

/**
 * Media upload dialog to send media like image, audio, video and file as message
 */
function MediaUploadDialog(props) {

    const { open, onClose } = props

    const dispatch = useDispatch()
    const uploadTaskRef = useRef(null)
    const captionInputRef = useRef(null)
    const destFileRef = useRef(null)
    const fileObjectUrlRef = useRef("")
    const { theme } = useAppTheme()
    const loggedUser = useSelector(rootState => rootState.app.loggedUser)
    const [selectedFile, setSelectedFile] = useState({ file: null, type: "" })
    const [uploadProgress, setUploadProgress] = useState({ isPaused: false, value: 0 })
    const [downloadUrl, setDownloadUrl] = useState("")

    const closeButtonClicked = () => {
        if (Boolean(downloadUrl) && destFileRef.current)
            deleteObject(destFileRef.current)
        onClose()
    }

    /**
     * When file is selected in the file picker upload to firebase storage based on it mimeType
     * @param {File} file selected file
     */
    const fileSelected = (file) => {
        let destUrl = ""

        if (loggedUser) {
            if (file.type.includes("image")) {
                destUrl = `message-uploads/images/${loggedUser.userId}/${file.name}`
                setSelectedFile({ file, type: "IMAGE" })
            } else if (file.type.includes("video")) {
                destUrl = `message-uploads/videos/${loggedUser.userId}/${file.name}`
                setSelectedFile({ file, type: "VIDEO" })
            } else if (file.type.includes("audio")) {
                destUrl = `message-uploads/audios/${loggedUser.userId}/${file.name}`
                setSelectedFile({ file, type: "AUDIO" })
            } else {
                destUrl = `message-uploads/files/${loggedUser.userId}/${file.name}`
                setSelectedFile({ file, type: "FILE" })
            }

            fileObjectUrlRef.current = URL.createObjectURL(file)
            const storage = getStorage()
            destFileRef.current = ref(storage, destUrl)

            const uploadTask = uploadBytesResumable(destFileRef.current, file)
            uploadTaskRef.current = uploadTask

            uploadTask.on("state_changed",
                (snapshot) => {
                    const totalBytes = snapshot.totalBytes
                    const bytesTransferred = snapshot.bytesTransferred
                    setUploadProgress({ isPaused: false, value: (bytesTransferred / totalBytes) * 100 })
                },
                (err) => console.log(err.serverResponse),
                () => getDownloadURL(destFileRef.current).then(url => setDownloadUrl(url))
            )
        }
    }

    /**
     * when upload button is clicked either pause and resume the upload
     */
    const progressButtonClicked = () => {
        if (uploadTaskRef.current) {
            if (uploadProgress.isPaused) {
                const bytesTransferred = uploadTaskRef.current.snapshot.bytesTransferred
                const totalBytes = uploadTaskRef.current.snapshot.totalBytes
                setUploadProgress({ isPaused: false, value: (bytesTransferred / totalBytes) * 100 })
                uploadTaskRef.current.resume()
            } else {
                setUploadProgress({ isPaused: true, value: 0 })
                uploadTaskRef.current.pause()
            }
        }
    }

    /**
     * Send the uploaded media as message to the target
     */
    const sendButtonClicked = () => {
        if (Boolean(downloadUrl) && captionInputRef.current)
            dispatch(MessagesReducerThunks.sendMessage({
                contentType: selectedFile.type,
                content: { url: downloadUrl, caption: captionInputRef.current.value, name: selectedFile.file.name, size: selectedFile.file.size }
            }))
        onClose()
    }

    /**
     * Effect to run when dialog is closed. When dialog is closed reset dialog's state and refs
     */
    useEffect(() => {
        if (!open) {
            // time out for .5s because dialog close animation will be slow and will cause flickering
            setTimeout(() => {
                setSelectedFile({ file: null, type: "" })
                fileObjectUrlRef.current = ""
                setDownloadUrl("")
                destFileRef.current = null
                if (uploadTaskRef.current) {
                    uploadTaskRef.current.cancel()
                    uploadTaskRef.current = null
                }
            }, 500);
        }
    }, [open])

    const isMediaUploaded = Boolean(downloadUrl)

    return (
        <Dialog id="media-upload-dialog" className={`theme-${theme}`} open={open}>
            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={closeButtonClicked}>
                    <CloseIcon />
                </IconButton>
                <h1 className="header__title">Upload Media</h1>
            </div>

            <div className="content">
                {selectedFile.file ? (
                    <>
                        {(() => {
                            switch (selectedFile.type) {
                                case "IMAGE":
                                    return <img src={fileObjectUrlRef.current} alt="" className="picked-image" />
                                case "VIDEO":
                                    return <video src={fileObjectUrlRef.current} className="picked-video"></video>
                                case "AUDIO":
                                    return (
                                        <div className="placeholder audio-placeholder">
                                            <AudioIcon fontSize="large" />
                                            <div className="file-details">
                                                <p className="file-name">{selectedFile.file.name}</p>
                                                <p className="file-size">{selectedFile.file.size / 1000} bytes</p>
                                            </div>
                                        </div>
                                    )
                                case "FILE":
                                    return (
                                        <div className="placeholder file-placeholder">
                                            <div className="file-icon-container">
                                                <FileIcon fontSize="large" />
                                            </div>
                                            <div className="file-details">
                                                <p className="file-name">{selectedFile.file.name}</p>
                                                <p className="file-size">{selectedFile.file.size / 1000} bytes</p>
                                            </div>
                                        </div>
                                    )
                                default:
                                    return <>Unknown File</>
                            }
                        })()}

                        {!isMediaUploaded ? (
                            <IconButton className="progress-button" onClick={progressButtonClicked}>
                                <CircularProgress value={uploadProgress.value} variant="determinate" />
                                {uploadProgress.isPaused ? (
                                    <UploadIcon className="progress-button__icon" />
                                ) : (
                                    <CloseIcon className="progress-button__icon" />
                                )}
                            </IconButton>
                        ) : null}
                    </>
                ) : (
                    <FilePicker text="Drag and Drop image here or Click here to browse" onFileSelected={fileSelected} />
                )}
            </div>

            <div className="action-container">
                <input ref={captionInputRef} type="text" className="caption-input" placeholder="Captions..." />
                <Button className={`theme-${theme}`} variant="contained" disableElevation disabled={!isMediaUploaded} onClick={sendButtonClicked}>Send</Button>
            </div>
        </Dialog>
    )
}

MediaUploadDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onProceed: PropTypes.func.isRequired
}

export default memo(MediaUploadDialog, (prevProps, nextProps) => prevProps.open === nextProps.open)
