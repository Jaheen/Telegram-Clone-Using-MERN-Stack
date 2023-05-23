import CheckBox from "@mui/material/Checkbox";
import CloseIcon from "@mui/icons-material/Close"
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { useEffect, useRef, useState } from "react";
import useAppTheme from "hooks/useAppTheme";
import PropTypes from "prop-types";
import "./styles.scss"


function CreatePollDialog(props) {

    const { open, onClose, onProceed } = props

    const settingsRef = useRef({ allowMultipleOptions: false })
    const { theme } = useAppTheme()
    const [question, setQuestion] = useState("")
    const [options, setOptions] = useState([""])

    /**
     * When question is changed update question
     * @param {React.FormEvent} ev TextField onChangeEvent
     */
    const questionFieldChangeHandler = (ev) => setQuestion(ev.target.value)

    /**
     * When input is changed add new option if option being edited is last one, else modify option
     * @param {React.FormEvent} ev TextField onChangeEvent
     * @param {Number} optionIndex index of currently editing option
     */
    const optionInputChangeHandler = (ev, optionIndex) => {
        const newOptions = [...options]
        newOptions[optionIndex] = ev.target.value
        if (optionIndex === newOptions.length - 1)
            newOptions.push("")
        setOptions(newOptions)
    }

    /**
     * Function to delete an option when close icon button in endAdornment is clicked 
     * @param {Number} optionIndex index of option to be deleted
     */
    const deleteOptionClickHandler = (optionIndex) => {
        const optionsAfterDeletion = options.filter((_, index) => index !== optionIndex)
        setOptions(optionsAfterDeletion)
    }

    /**
     * Handler to handler create button clicked event
     */
    const createButtonClickHandler = () => {
        const nonNullOptions = options.filter(option => option.trim() !== "")
        if (nonNullOptions.length >= 2) {
            onProceed(question, nonNullOptions, settingsRef.current)
        }
    }

    useEffect(() => {
        if (!open) {
            setQuestion("")
            setOptions([""])
        }
    }, [open])

    return (
        <Dialog id="create-poll-dialog" open={open} className={`theme-${theme}`}>

            <div className="form-section header">
                <IconButton className={`theme-${theme}`} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
                <div className="header__title">New Poll</div>

                <Button id="create-button" className={`theme-${theme}`} variant="contained"
                    disableElevation disabled={question.trim() === ""} onClick={createButtonClickHandler}>Create</Button>

                <TextField className={`input-field question-field theme-${theme}`} fullWidth label="Question"
                    value={question} onChange={questionFieldChangeHandler} />
            </div>

            <Divider />

            <div className="scrollable-section">

                <div className="form-section options">
                    <div className="section__title">Options</div>
                    {options.map((option, index) => {

                        // Adornment not for last option but for all other option
                        const endAdornment = index < options.length - 1 ? (
                            <IconButton className={`theme-${theme}`} onClick={_ => deleteOptionClickHandler(index)}>
                                <CloseIcon />
                            </IconButton>
                        ) : null

                        return (
                            <div className="option" key={index}>
                                <TextField fullWidth className={`option__input theme-${theme}`}
                                    value={option}
                                    onChange={event => optionInputChangeHandler(event, index)}
                                    placeholder="Add an option"
                                    label={`Option ${index + 1}`}
                                    InputProps={{ endAdornment }} />
                            </div>
                        )
                    })}
                </div>

                <Divider />

                <div className="form-section settings">
                    <div className="section__title">Settings</div>
                    {/* <div className="setting">
                        <CheckBox className={`theme-${theme}`} />
                        <span className="setting__title">Anonymous Voting</span>
                    </div> */}
                    <div className="setting">
                        <CheckBox className={`theme-${theme}`} onChange={(_, checked) => settingsRef.current.allowMultipleOptions = checked} />
                        <span className="setting__title">Multiple Options</span>
                    </div>
                    {/* <div className="setting">
                        <CheckBox className={`theme-${theme}`} />
                        <span className="setting__title">Quiz Mode</span>
                    </div> */}
                </div>
            </div>
        </Dialog>
    )
}

CreatePollDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onProceed: PropTypes.func.isRequired
}

export default CreatePollDialog