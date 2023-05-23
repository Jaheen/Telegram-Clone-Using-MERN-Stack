import { memo, useContext } from 'react'
import TimeStampUtils from 'utils/time-stamp-utils'
import { MessageItemContext } from '..'
import useAppTheme from 'hooks/useAppTheme'
import "./styles.scss"

function VideoMessage() {

    const { theme } = useAppTheme()
    const { message, messageClass } = useContext(MessageItemContext)

    return (
        <section className={`video-message theme-${theme} ${messageClass}`}>
            <video src={message.content.url} className="video" />
            <div className="footer">
                <span className="timestamp">
                    {TimeStampUtils.getFormattedTime(message.timestamp)}
                </span>
            </div>
        </section>
    )
}

export default memo(VideoMessage)
