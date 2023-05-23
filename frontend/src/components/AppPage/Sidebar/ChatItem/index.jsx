import PushPinIcon from '@mui/icons-material/PushPinOutlined'
import VolumeOffIcon from '@mui/icons-material/VolumeOffOutlined'
import Avatar from "@mui/material/Avatar"
import { memo, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"
import ChatItemContextMenu from "./ChatItemContextMenu"
import { parseChatData } from "./helper"
import useAppTheme from 'hooks/useAppTheme'
import "./styles.scss"

/**
 * Chat Item to represent chats in the list
 */
function ChatItem(props) {

    const [contextMenu, setContextMenu] = useState({ open: false, X: 0, Y: 0 })
    const {theme} = useAppTheme()
    const params = useParams()
console.log(props.chat)
    const chat = parseChatData(props.chat)

    /**
     * Open chat Item context menu on context event
     * @param {React.MouseEvent} event event for right click
     */
    const chatItemContext = (event) => {
        event.preventDefault()
        const X = event.pageX
        const Y = event.pageY
        setContextMenu({ open: true, X: X, Y: Y })
    }

    let activeClass = params.targetId === chat.targetId ? "active" : "inactive"
    const textBackgroundClass = `gradient-background-${chat.avatarText.charCodeAt(0) % 7}`

    return (
        <>
            <Link to={chat.onClickLink} replace className={`chat-item theme-${theme} ${activeClass}`} onContextMenu={chatItemContext}>
                {chat.hasAvatar ? (
                    <Avatar className="chat-item__avatar" src={chat.avatarUrl} />
                ) : (
                    <Avatar className={`chat-item__avatar ${textBackgroundClass}`}>{chat.avatarText}</Avatar>
                )}
                <section className="chat-item__details">
                    <div className="chat-item__details-row">
                        <p className="chat-item__name">{chat.chatName}</p>
                        {chat.isMuted ? (<VolumeOffIcon className="chat-flag-icon" />) : null}
                        <span className="chat-item__last-active">{chat.parsedTimestamp}</span>
                    </div>
                    <div className="chat-item__details-row">
                        <p className="chat-item__last-message">
                            {chat.hasLastMessage ? (
                                (() => {
                                    switch (chat.lastMessage.contentType) {
                                        case "IMAGE":
                                            return `Image: ${chat.lastMessage.content.url}`
                                        case "VIDEO":
                                            return `Video: ${chat.lastMessage.content.url}`
                                        case "AUDIO":
                                            return `Audio: ${chat.lastMessage.content.url}`
                                        case "FILE":
                                            return `File: ${chat.lastMessage.content.filename}`
                                        case "POLL":
                                            return `Poll: ${chat.lastMessage.content.question}`
                                        default:
                                            return chat.lastMessage.content
                                    }
                                })()
                            ) : null}
                        </p>
                        {chat.isPinned ? (<PushPinIcon className="chat-flag-icon" />) : null}
                        {chat.hasUnreadMessages ? (
                            <span className="chat-item__unread-count">
                                {chat.unreadMessages}
                            </span>
                        ) : null}
                    </div>
                </section>
            </Link>

            {/* Context Menu */}
            <ChatItemContextMenu open={contextMenu.open} chat={chat}
                anchorPosition={{ left: contextMenu.X, top: contextMenu.Y }}
                onClose={_ => setContextMenu({ ...contextMenu, open: false })} />
        </>
    )
}

export default memo(ChatItem)