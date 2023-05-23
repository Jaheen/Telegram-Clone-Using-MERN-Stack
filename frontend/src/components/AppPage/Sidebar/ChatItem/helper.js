import TimeStampUtils from "utils/time-stamp-utils"

/**
 * Helper function to parse chat data and return only useful data to chat item for rendering
 * @param {Object} chat chat object to be parsed
 */
export function parseChatData(chat) {
    const { targetId, chatType, unreadMessages, lastMessage, lastActiveTime } = chat
    const data = {
        chatId: chat.chatId,
        targetId: chat.targetId,
        onClickLink: `${chatType}/${targetId}`,
        chatType: chat.chatType,
        chatName: "",
        hasAvatar: false,
        avatarUrl: "",
        avatarText: "",
        hasUnreadMessages: Boolean(unreadMessages),
        unreadMessages: unreadMessages < 1000 ? unreadMessages : "999+",
        parsedTimestamp: lastActiveTime ? TimeStampUtils.getFormattedTimeStamp(lastActiveTime) : "",
        isPinned: chat.isPinned,
        isArchived: chat.isArchived,
        isMuted: chat.isMuted,
        hasLastMessage: Boolean(lastMessage),
        lastMessage
    }

    switch (chat.chatType) {
        case "private": {
            let { firstName, lastName, avatarUrl } = chat.targetUser
            const contact = chat.contact

            if (contact) {
                firstName = contact.firstName
                lastName = contact.lastName
            }

            data.hasAvatar = Boolean(avatarUrl)
            data.chatName = firstName
            data.avatarText = firstName.substring(0, 1)
            data.avatarUrl = avatarUrl

            if (lastName) {
                data.chatName = data.chatName + " " + lastName
                data.avatarText = data.avatarText + lastName.substring(0, 1)
            }

            break
        }
        case "group": {
            const { groupName, avatarUrl } = chat.targetGroup
            data.chatName = groupName
            data.hasAvatar = Boolean(avatarUrl)
            data.avatarUrl = avatarUrl
            data.avatarText = groupName.substring(0, 1)
            break
        }
        case "channel": {
            const { channelName, avatarUrl } = chat.targetChannel
            data.chatName = channelName
            data.hasAvatar = Boolean(avatarUrl)
            data.avatarUrl = avatarUrl
            data.avatarText = channelName.substring(0, 1)
            break
        }
        default:
            break
    }

    return data
}