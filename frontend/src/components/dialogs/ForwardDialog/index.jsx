import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import Dialog from "@mui/material/Dialog"
import PropTypes from "prop-types"
import useAppTheme from "hooks/useAppTheme"
import { useState } from "react"
import { useSelector } from "react-redux"
import Profile from "components/common/Profile"
import "./styles.scss"


function ForwardDialog(props) {

    const { open, onClose, onSelected } = props

    const { theme } = useAppTheme()
    const chats = useSelector(rootState => rootState.chats.chats.filter(chat => chat.chatType !== "private"))
    const contacts = useSelector(rootState => rootState.contacts.contacts)
    const [searchText, setSearchText] = useState("")

    return (
        <Dialog open={open} className={`forward-messages-modal theme-${theme}`}>
            <div className="header">
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
                <div className="header__title">
                    <input className="searchbox" value={searchText} onChange={ev => setSearchText(ev.target.value)} type="text" placeholder="Forward to..." />
                </div>
            </div>

            <div className="profiles-list">
                {/* list groups and channels */}
                {chats.filter(chat => {
                    const { chatType, targetGroup, targetChannel } = chat

                    if (chatType === "group")
                        return targetGroup.groupName.toLowerCase().includes(searchText.toLowerCase())
                    else if (chatType === "channel")
                        return targetChannel.channelName.toLowerCase().includes(searchText.toLowerCase())

                    return true
                }).map(chat => {
                    const { chatId, chatType, targetId, targetGroup, targetChannel } = chat

                    if (chatType === "group") {
                        const { groupName, membersCount, avatarUrl } = targetGroup

                        return <Profile key={chatId} variant="list-item" onClick={() => onSelected("group", targetId)}
                            profileName={groupName}
                            profileMeta={membersCount > 1 ? `${membersCount} members` : "1 member"}
                            avatarUrl={avatarUrl}
                            avatarText={groupName.substring(0, 1)} />

                    } else if (chatType === "channel") {
                        const { channelName, subscribersCount, avatarUrl } = targetChannel

                        return <Profile key={chatId} variant="list-item" onClick={() => onSelected("channel", targetId)}
                            profileName={channelName}
                            profileMeta={subscribersCount > 1 ? `${subscribersCount} subscribers` : "1 subscriber"}
                            avatarUrl={avatarUrl}
                            avatarText={channelName.substring(0, 1)} />
                    }

                    return null
                })}

                {/* list contacts */}
                {contacts.filter(contact => {
                    const { firstName, lastName } = contact
                    return `${firstName} ${lastName}`.toLowerCase().includes(searchText.toLowerCase())
                }).map(contact => {
                    const { contactId, firstName, lastName, avatarText, targetUserId, targetUser: { avatarUrl } } = contact

                    let fullName = firstName
                    if (lastName)
                        fullName += " " + lastName

                    return <Profile key={contactId} variant="list-item" onClick={() => onSelected("private", targetUserId)}
                        profileName={fullName}
                        avatarText={avatarText}
                        avatarUrl={avatarUrl} />
                })}
            </div>
        </Dialog>
    )
}

ForwardDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelected: PropTypes.func.isRequired
}

export default ForwardDialog
