import { memo, useContext } from 'react'
import { useSelector } from 'react-redux'
import TimeStampUtils from 'utils/time-stamp-utils'
import { MessageItemContext } from '..'
import DeliveryStatusIndicator from '../DeliveryStatusIndicator'
import "./styles.scss"

function PictureMessage() {

    const theme = useSelector(rootState => rootState.app.theme)
    const { message, messageClass } = useContext(MessageItemContext)

    const hasCaptions = Boolean(message.content.caption)

    return (
        <section className={`picture-message theme-${theme} ${messageClass}`}>
            <img src={message.content.url} alt="" className="content-image" />

            {hasCaptions ? (
                <div className="caption-container">
                    <p className="caption">{message.content.caption}</p>
                </div>
            ) : null}

            <div className="meta-container">
                <span className="timestamp">
                    {TimeStampUtils.getFormattedTime(message.timestamp, TimeStampUtils.TWELVE_HOUR_FORMAT)}
                </span>
                <div className="delivery-status">
                    <DeliveryStatusIndicator />
                </div>
            </div>
        </section>
    )
}

export default memo(PictureMessage)