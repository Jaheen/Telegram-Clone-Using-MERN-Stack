import { MessagingService } from "api/socket/services"
import useAppTheme from "hooks/useAppTheme"
import { Fragment, memo, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { MessagesReducerThunks } from "store/messages-reducer"
import TimeStampUtils from "utils/time-stamp-utils"
import MessageItem from "./MessageItem"
import MessageItemContextMenu from "./MessageItemContextMenu"
import "./styles.scss"


/**
 * Container to list all messages
 */
function MessagesList() {

    const dispatch = useDispatch()
    const params = useParams()
    const lastMessageObserverRef = useRef(null)
    const messageSeenObserverRef = useRef(null)
    const prevMessagesLengthRef = useRef(0)
    const { theme } = useAppTheme()
    const messages = useSelector(rootState => rootState.messages.messages)
    const loggedUser = useSelector(rootState => rootState.app.loggedUser)
    const [contextMenu, setContextMenu] = useState({ open: false, X: 0, Y: 0, message: null })

    /**
     * Handler for handling context menu event on MessageItem
     * @param {React.MouseEvent} event contextMenuEvent from messageItem
     * @param {object} message message of messageItem that emitted the event
     */
    const messageItemContextMenuHandler = (event, message) => {
        event.preventDefault()
        const X = event.pageX
        const Y = event.pageY
        setContextMenu({ open: true, X, Y, message })
    }

    // effect to update new received messages
    useEffect(() => {
        if (params.chatType === "private") {
            const receivedMessageIds = []
            messages.forEach(message => {
                if (!message.isIdTemporary && message.senderId === params.targetId && !message.isReceived)
                    receivedMessageIds.push(message.messageId)
            })
            if (receivedMessageIds.length !== 0)
                MessagingService.emitMessagesReceived(params.chatType, params.targetId, receivedMessageIds)
        }
        // eslint-disable-next-line
    }, [messages, params])

    // effect to observe and update seen status
    useEffect(() => {
        if (params.chatType === "private") {
            if (messageSeenObserverRef.current === null) {
                messageSeenObserverRef.current = new IntersectionObserver((entries, observer) => {
                    const seenMessageIds = []
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            observer.unobserve(entry.target)
                            seenMessageIds.push(entry.target.getAttribute("message-id"))
                        }
                    })
                    if (seenMessageIds.length !== 0)
                        MessagingService.emitMessagesSeen(params.chatType, params.targetId, seenMessageIds)
                })
            }
        }

        lastMessageObserverRef.current = new IntersectionObserver((entries, observer) => {
            console.log(entries)
            if (entries.length !== 0) {
                const target = entries[0].target
                const messageId = target.getAttribute("message-id")
                dispatch(MessagesReducerThunks.fetchMessages({ chatType: params.chatType, targetId: params.targetId, before: messageId }))
                observer.unobserve(target)
            }
        })

        return () => {
            if (params.chatType === "private")
                if (messageSeenObserverRef.current instanceof IntersectionObserver)
                    messageSeenObserverRef.current.disconnect()

            if (lastMessageObserverRef.current instanceof IntersectionObserver)
                lastMessageObserverRef.current.disconnect()
        }
        // eslint-disable-next-line
    }, [params])

    useLayoutEffect(() => {
        if (messages instanceof Array && messages.length !== 0 && messages.length !== prevMessagesLengthRef.current) {
            const messagesToBeObserved = messages.filter(message => message.senderId !== loggedUser.userId && !message.isSeen)
            messagesToBeObserved.forEach(message => {
                const targetMessageItem = document.querySelector(`.message-item[message-id="${message.messageId}"]`)
                if (targetMessageItem instanceof HTMLElement && messageSeenObserverRef.current instanceof IntersectionObserver) {
                    messageSeenObserverRef.current.observe(targetMessageItem)
                }
            })

            if (lastMessageObserverRef.current instanceof IntersectionObserver) {
                const lastMessage = messages[messages.length - 1]
                const lastMessageItem = document.querySelector(`.message-item[message-id="${lastMessage.messageId}"]`)
                if (lastMessageItem instanceof HTMLElement) {
                    lastMessageObserverRef.current.observe(lastMessageItem)
                }
            }

            prevMessagesLengthRef.current = messages.length
        }
        // eslint-disable-next-line
    }, [messages])

    return (
        <section id="messages-list" className={`theme-${theme}`}>
            {messages.map((message, index) => {
                const datestamp = TimeStampUtils.getFormattedDate(message.timestamp)
                const lastIndex = messages.length - 1

                let renderDatestamp = false

                if (index + 1 <= lastIndex) {
                    const nextDatestamp = TimeStampUtils.getFormattedDate(messages[index + 1].timestamp)
                    renderDatestamp = datestamp !== nextDatestamp
                }

                if (index === lastIndex) {
                    renderDatestamp = true
                }

                return (
                    <Fragment key={message.messageId}>
                        <MessageItem message={message} onContextMenu={messageItemContextMenuHandler} />
                        {renderDatestamp ? (<div className="info-bubble">{datestamp}</div>) : null}
                    </Fragment>
                )
            })}

            {/* Context Menu for Right Click action on MessageItem */}
            <MessageItemContextMenu open={contextMenu.open} message={contextMenu.message} onClose={_ => setContextMenu({ ...contextMenu, open: false })}
                anchorPosition={{ left: contextMenu.X, top: contextMenu.Y }} />
        </section>
    )
}

export default memo(MessagesList)