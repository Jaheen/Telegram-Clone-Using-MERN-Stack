import { memo, useRef, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessagesReducerActions } from "store/messages-reducer";
import MessageItemSelector from "./MessageItemSelector";
import TextMessage from "./TextMessage";
import PictureMessage from "./PictureMessage";
import VideoMessage from "./VideoMessage";
import AudioMessage from "./AudioMessage";
import useAppTheme from "hooks/useAppTheme";
import LinkMessage from "./LinkMessage";
import FileMessage from "./FileMessage";
import "./styles.scss"


/**
 * React Context to send message item props and event handlers into deep components
 */
export const MessageItemContext = createContext({})
MessageItemContext.displayName = "Context for Every MessageItem"

/**
 * Message Item contains the message
 */
function MessageItem(props) {

    // message data from props
    const { message, onContextMenu } = props

    const dispatch = useDispatch()
    const rootRef = useRef(null)
    const { theme } = useAppTheme()
    const loggedUser = useSelector(rootState => rootState.app.loggedUser)
    const isSelectionModeOn = useSelector(rootState => rootState.messages.isSelectionModeOn)

    // class name variable for message to align left or right
    const messageClass = loggedUser.userId === message.senderId ? "sent" : "recieved"
    // class name to control selection button visibility
    const selectorClass = isSelectionModeOn ? "enabled" : "disabled"

    const contextValue = {
        message,
        messageClass,
        selectorClass,
        onSelect: () => {
            if (message.isSelected) dispatch(MessagesReducerActions.deselectMessage(message.messageId))
            else dispatch(MessagesReducerActions.selectMessage(message.messageId))
        }
    }
    
    return (
        <MessageItemContext.Provider value={contextValue}>

            <section message-id={message.messageId} ref={rootRef} className={`message-item theme-${theme}`} onContextMenu={ev => onContextMenu(ev, message)}>

                <div className="message-container">

                    {/* Selector to select messages */}
                    <MessageItemSelector />

                    {(() => {
                        switch (message.contentType) {
                            case "TEXT":
                                return <TextMessage />
                            case "IMAGE":
                                return <PictureMessage />
                            case "VIDEO":
                                return <VideoMessage />
                            case "AUDIO":
                                return <AudioMessage />
                            case "FILE":
                                return <FileMessage />
                            case "LINK":
                                return <LinkMessage />
                            default:
                                console.log(JSON.stringify(message.content))
                                return (
                                    <div className="unknown-content">{"unknown message type"}</div>
                                )
                        }
                    })()}

                </div>

            </section>
        </MessageItemContext.Provider>

    )
}

export default memo(MessageItem)