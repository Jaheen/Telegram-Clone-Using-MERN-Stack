export function parseActiveChat(activeChat) {

    const data = {
        chatId: "",
        canRenderEditButton: false,
        canRenderNotificationsMenuItem: false,
        profileData: {
            avatarUrl: "",
            avatarText: "",
            profileName: "",
            profileMeta: ""
        },
        isChatMuted: false
    }

    if (activeChat) {

        const { chatType, targetUser, contact, targetGroup, targetChannel, chatId, isMuted } = activeChat

        if (chatId) {
            data.chatId = chatId
            data.canRenderNotificationsMenuItem = true
        }

        if (isMuted)
            data.isChatMuted = true

        switch (chatType) {
            case "private": {
                let { avatarUrl, firstName, lastName } = targetUser

                if (contact) {
                    data.canRenderEditButton = true
                    firstName = contact.firstName
                    lastName = contact.lastName
                }

                data.profileData.profileName = `${firstName} ${lastName ? lastName : ""}`
                data.profileData.avatarUrl = avatarUrl
                data.profileData.avatarText = firstName.substring(0, 1)

                if (lastName)
                    data.profileData.avatarText += lastName.substring(0, 1)

                break
            }
            case "group": {
                const { groupName, avatarUrl, membership, membersCount } = targetGroup

                data.profileData.profileName = groupName
                data.profileData.avatarUrl = avatarUrl
                data.profileData.avatarText = groupName.substring(0, 1)
                data.profileData.profileMeta = membersCount > 1 ? `${membersCount} members` : `1 member`

                if (membership && membership.isAdmin)
                    data.canRenderEditButton = true
                break
            }
            case "channel": {
                const { channelName, avatarUrl, subscription, subscribersCount } = targetChannel

                data.profileData.profileName = channelName
                data.profileData.avatarUrl = avatarUrl
                data.profileData.avatarText = channelName.substring(0, 1)
                data.profileData.profileMeta = subscribersCount > 1 ? `${subscribersCount} subscribers` : `1 subscriber`

                if (subscription && subscription.isAdmin)
                    data.canRenderEditButton = true
                break
            }
            default:
                break
        }
    }

    return data
}