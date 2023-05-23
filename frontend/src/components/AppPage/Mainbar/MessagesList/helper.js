/**
 * Helper function to decide whether the delete button should be rendered on the message item context menu.
 * @param {object} activeChat activeChat in redux store
 * @param {object} loggedUser user data from redux store
 * @param {object} currentMessage current message for which context menu is triggered
 * @param {object} isSelectionModeOn flag from redux store
 * @param {Array<object>} selectedMessages array of messages that are selected
 * @returns {boolean} a boolean value
 */
export function shouldRenderDeleteButton(activeChat, loggedUser, currentMessage, isSelectionModeOn, selectedMessages) {

    if (!currentMessage)
        return false
    if (!selectedMessages)
        return false

    const { userId } = loggedUser

    if (isSelectionModeOn && selectedMessages.length !== 0) {
        let result = true
        selectedMessages.forEach(message => result = result && message.senderId === userId)

        switch (activeChat.chatType) {
            case "private":
                return result
            case "group":
                return result || (activeChat.targetGroup.membership && activeChat.targetGroup.membership.isAdmin)
            case "channel":
                return activeChat.targetChannel.subscription && activeChat.targetChannel.subscription.isAdmin
            default:
                break
        }
    } else {
        switch (activeChat.chatType) {
            case "private":
                return currentMessage.senderId === userId
            case "group":
                return currentMessage.senderId === userId || (activeChat.targetGroup.membership && activeChat.targetGroup.membership.isAdmin)
            case "channel":
                return activeChat.targetChannel.subscription && activeChat.targetChannel.subscription.isAdmin
            default:
                break
        }
    }
}