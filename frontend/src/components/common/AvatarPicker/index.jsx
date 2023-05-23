import AddAPhotoIcon from '@mui/icons-material/AddAPhotoOutlined'
import { memo, useRef, useState } from 'react'
import PropTypes from "prop-types"
import CircularProgress from '@mui/material/CircularProgress'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import "./styles.scss"


function AvatarPicker(props) {

    const { avatarUrl, avatarText, targetFolder, onChange } = props

    const fileInputRef = useRef(null)
    const uploadTaskRef = useRef(null)
    const [uploadProgress, setUploadProgress] = useState(0)

    /**
     * After file selected, if it is image file then upload to firebase and call onChange listener
     * @param {React.FormEvent} ev file selected event
     */
    const fileSelectedHandler = (ev) => {
        if (ev.target.files && ev.target.files.length !== 0) {
            const file = ev.target.files[0]
            if (file.type.includes("image")) {

                // if already a file is being uploaded stop it
                if (uploadTaskRef.current !== null && uploadTaskRef.current.snapshot.state === "running") {
                    uploadTaskRef.current.cancel()
                    setUploadProgress(0)
                }

                const storage = getStorage()
                const targetRef = ref(storage, `profile-uploads/${targetFolder}/${new Date().toISOString()}-${file.name}`)

                const uploadTask = uploadTaskRef.current = uploadBytesResumable(targetRef, file)

                setUploadProgress(5)

                uploadTask.on("state_changed",
                    (snapshot) => {
                        const totalBytes = snapshot.totalBytes
                        const bytesTransferred = snapshot.bytesTransferred
                        setUploadProgress((bytesTransferred / totalBytes) * 100)
                    },
                    (err) => console.log(err.serverResponse),
                    () => {
                        getDownloadURL(targetRef).then(url => onChange(url))
                        setUploadProgress(0)
                    }
                )
            }
        }
    }

    const hasAvatar = typeof avatarUrl === "string" && avatarUrl.trim() !== ""
    const backgroundClass = `gradient-background-${avatarText.charCodeAt(0) % 7}`

    return (
        <div className={`avatar-picker ${backgroundClass}`}>
            {hasAvatar ? (
                <div className="avatar-image">
                    <img src={avatarUrl} alt={avatarText} />
                </div>
            ) : (
                <div className="avatar-text">{avatarText.toUpperCase()}</div>
            )}

            <input type="file" hidden ref={fileInputRef} onInput={fileSelectedHandler} />

            <div className="avatar-picker-icon" onClick={() => fileInputRef.current.click()}>
                <AddAPhotoIcon />
            </div>

            {uploadProgress > 0 ? (
                <CircularProgress variant="determinate" value={uploadProgress} />
            ) : null}
        </div >
    )
}

AvatarPicker.defaultProps = {
    avatarUrl: "",
    avatarText: "ab"
}

AvatarPicker.propTypes = {
    avatarUrl: PropTypes.string.isRequired,
    avatarText: PropTypes.string.isRequired,
    targetFolder: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
}

export default memo(AvatarPicker)