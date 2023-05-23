import { memo, useContext } from "react"
import { useSelector } from "react-redux"
import TimeStampUtils from "utils/time-stamp-utils"
import { MessageItemContext } from ".."
import DeliveryStatusIndicator from "../DeliveryStatusIndicator"
import "./styles.scss"

function TextMessage() {

    const theme = useSelector(rootState => rootState.app.theme)
    const { message, messageClass } = useContext(MessageItemContext)

    const headerClass = message.messageType === "private" ? "invisible" : "visible"

    return (
        <section className={`text-message theme-${theme} ${messageClass}`}>
            <div className={`header ${headerClass}`}>

            </div>
            <div className="message-content">
                {message.content}
                <div className="meta-container">
                    <span className="timestamp">
                        {TimeStampUtils.getFormattedTime(message.timestamp, TimeStampUtils.TWELVE_HOUR_FORMAT)}
                    </span>
                    <span className="message-status">
                        <DeliveryStatusIndicator />
                    </span>
                </div>
            </div>
        </section>
    )
}

export default memo(TextMessage)