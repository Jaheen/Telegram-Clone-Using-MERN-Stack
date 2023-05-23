/**
 * Helper function to decide whether delete button should be rendered or not on Message Selection Overlay Component depending on chatType and selectedMessages
 * @param {object} activeChat active chat from the redux store
 * @param {object} loggedUser object containing logged user data from store
 * @param {Array} selectedMessages array of selected messages
 * @returns {boolean} a boolean result
 */
export function shouldRenderDeleteButton(activeChat, loggedUser, selectedMessages) {
    switch (activeChat.chatType) {
        case "private": {
            let result = true
            selectedMessages.forEach(message => result = result && message.senderId === loggedUser.userId)
            return result
        }
        case "group":
            if (activeChat.targetGroup.membership) {
                if (activeChat.targetGroup.membership.isAdmin)
                    return true
                else {
                    let result = true
                    selectedMessages.forEach(message => result = result && message.senderId === loggedUser.userId)
                    return result
                }
            } else return false
        case "channel":
            if (activeChat.targetChannel.subscription && activeChat.targetChannel.subscription.isAdmin)
                return true
            else return false
        default:
            return false
    }
}