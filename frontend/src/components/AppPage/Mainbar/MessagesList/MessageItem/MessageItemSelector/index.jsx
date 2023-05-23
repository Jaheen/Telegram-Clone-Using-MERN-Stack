import DoneIcon from '@mui/icons-material/Done'
import { memo, useContext } from 'react'
import { useSelector } from 'react-redux'
import { MessageItemContext } from '..'
import "./styles.scss"

function MessageItemSelector() {

    const theme = useSelector(rootState => rootState.app.theme)
    const { message, selectorClass, onSelect } = useContext(MessageItemContext)

    const checkedClass = message.isSelected ? "checked" : "unchecked"

    return (
        <div className={`message-item-selector theme-${theme} ${selectorClass} ${checkedClass}`} onClick={onSelect}>
            <div className="selector__radio">
                <span className="selector__radio-fill">
                    <DoneIcon />
                </span>
            </div>
        </div>
    )
}

export default memo(MessageItemSelector)