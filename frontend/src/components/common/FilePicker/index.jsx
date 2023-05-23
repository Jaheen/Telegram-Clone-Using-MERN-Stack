import useAppTheme from "hooks/useAppTheme"
import { useRef } from "react"
import PropTypes from "prop-types"
import "./styles.scss"

function FilePicker(props) {

    const { text, onFileSelected } = props

    const fileInputRef = useRef(null)
    const { theme } = useAppTheme()

    /**
     * Handler for handler file drag over event to
     * @param {React.DragEvent} ev drag over event
     */
    const dragOverHandler = (ev) => {
        ev.preventDefault()
    }

    /**
     * Handler to handle when files are dropped on drop zone
     * @param {React.DragEvent} ev drag drop event
     */
    const onDropHandler = (ev) => {
        ev.preventDefault()

        if (ev.dataTransfer.items) {
            const dataTransferItems = [...ev.dataTransfer.items]
            if (dataTransferItems.length !== 0) {
                if (dataTransferItems[0].kind === "file") {
                    const file = dataTransferItems[0].getAsFile()
                    onFileSelected(file)
                }
            }
        }
    }

    /**
     * Handler for drop zone clicked
     */
    const onClickHandler = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    /**
     * Handler for file input event
     * @param {React.FormEvent} ev file input event
     */
    const fileInputChangeHandler = (ev) => {
        if (ev.target.files && ev.target.files.length !== 0) {
            onFileSelected(ev.target.files[0])
        }
    }

    return (
        <div className={`file-picker theme-${theme}`}>
            <div className="drop-zone" onDrop={onDropHandler} onDragOver={dragOverHandler} onClick={onClickHandler}>
                <div className="drop-message">{text}</div>
                <input type="file" hidden ref={fileInputRef} onInput={fileInputChangeHandler} multiple={false} />
            </div>
        </div>
    )
}

FilePicker.propTypes = {
    text: PropTypes.string.isRequired,
    onFileSelected: PropTypes.func.isRequired
}

export default FilePicker