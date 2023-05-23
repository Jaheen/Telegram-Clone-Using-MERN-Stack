/**
 * Utility class to format chat data for application's use
 */
export default class ChatDataUtils {

    /**
     * Format chat data from server in format needed for store
     * @param {object} data Chat Data fetched from server
     */
    static formatChatData(data) {

        data.onClickLink = `${data.chatType}/${data.targetId}`

        switch (data.chatType) {
            case "private": {
                let firstName = data.targetUser.firstName, lastName = data.targetUser.lastName

                if (data.contact) {
                    firstName = data.contact.firstName
                    lastName = data.contact.lastName
                }

                data.chatName = `${firstName} ${lastName}`
                data.chatMeta = data.targetUser.bio
                data.avatarUrl = data.targetUser.avatarUrl
                data.avatarText = firstName.substring(0, 1)
                break
            }
            case "group": {
                data.isMember = Boolean(data.membership)
                data.chatName = data.targetGroup.groupName
                data.chatMeta = data.targetGroup.membersCount > 1 ? `${data.targetGroup.membersCount} members` : `${data.targetGroup.membersCount} member`
                data.avatarUrl = data.targetGroup.avatarUrl
                data.avatarText = data.targetGroup.groupName.substring(0, 1)
                break
            }
            case "channel": {
                data.isSubscriber = Boolean(data.subscription)
                data.chatName = data.targetChannel.channelName
                data.chatMeta = data.targetChannel.subscribersCount > 1 ? `${data.targetChannel.subscribersCount} members` : `${data.targetChannel.subscribersCount} member`
                data.avatarUrl = data.targetChannel.avatarUrl
                data.avatarText = data.targetChannel.channelName.substring(0, 1)
                break
            }
            default:
                break
        }

        data.hasAvatar = Boolean(data.avatarUrl)
        data.hasUnreadMessages = Boolean(data.unreadMessages)
        data.hasLastMessage = Boolean(data.lastMessage)

        return data
    }

    /**
     * Format chat data from server for activeChat in store
     * @param {Object} data chatData from server
     * @returns formatted data for activeChat
     */
    static formatActiveChatData(data) {
        const formattedData = this.formatChatData(data)

        switch (data.chatType) {
            case "group": {
                formattedData.contactsInGroup = {}
                formattedData.members = []
                break
            }
            case "channel": {
                formattedData.contactsInChannel = {}
                formattedData.subscribers = []
                break
            }
            default:
                break
        }

        return formattedData
    }
}