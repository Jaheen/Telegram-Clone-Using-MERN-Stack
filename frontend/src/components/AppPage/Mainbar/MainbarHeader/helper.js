/**
 * Parse activeChat and return data in useful way for header
 * @param {Object} activeChat activeChat object to be parsed
 */
export function parseActiveChat(activeChat) {

    const { chatId, chatType, targetId, isMuted, isArchived, isPinned } = activeChat

    const data = {
        chatId,
        chatName: "",
        metaData: "",
        targetId,
        chatType,
        hasAvatar: false,
        avatarUrl: "",
        avatarText: "",
        isChatCreated: chatId !== undefined,
        isMuted, isArchived, isPinned
    }

    const contact = activeChat.contact
    const targetUser = activeChat.targetUser
    const targetGroup = activeChat.targetGroup
    const targetChannel = activeChat.targetChannel

    switch (chatType) {
        case "private": {
            let { firstName, lastName, avatarUrl, lastActive } = targetUser

            if (contact) {
                firstName = contact.firstName
                lastName = contact.lastName
            }

            data.chatName = firstName
            data.hasAvatar = Boolean(avatarUrl)
            data.avatarUrl = avatarUrl
            data.metaData = lastActive
            data.avatarText = `${firstName.substring(0, 1)}`

            if (Boolean(lastName)) {
                data.chatName = data.chatName + " " + lastName
                data.avatarText = data.avatarText + lastName.substring(0, 1)
            }

            break
        }
        case "group": {
            const { groupName, avatarUrl, membersCount } = targetGroup
            data.chatName = groupName
            data.hasAvatar = Boolean(avatarUrl)
            data.avatarUrl = avatarUrl
            data.metaData = membersCount > 1 ? `${membersCount} members` : `${membersCount} member`
            data.avatarText = groupName.substring(0, 1)
            break
        }
        case "channel": {
            const { channelName, avatarUrl, subscribersCount } = targetChannel
            data.chatName = channelName
            if (avatarUrl && avatarUrl !== "")
                data.hasAvatar = true
            data.avatarUrl = avatarUrl
            data.metaData = subscribersCount > 1 ? `${subscribersCount} subscribers` : `${subscribersCount} subscriber`
            data.avatarText = channelName.substring(0, 1)
            break
        }
        default:
            break
    }

    return data
}