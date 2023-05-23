export const addChatHandler = (state, action) => {
    const newChat = action.payload
    if (newChat) {
        const { chatId } = newChat

        // if existing chat with same chatid not exists add to chats list
        if (typeof chatId === "string") {
            const existingChatWithSameId = state.chats.find(chat => chat.chatId === chatId)
            if (existingChatWithSameId === undefined)
                state.chats = [newChat, ...state.chats]
        }

        // if activeChat matches newChat set as activeChat
        const activeChat = state.activeChat
        if (activeChat && activeChat.chatType === newChat.chatType && activeChat.targetId === newChat.targetId) {
            if (newChat.chatType === "group") {
                newChat.contactsInGroup = {}
                newChat.members = []
            }
            if (newChat.chatType === "channel") {
                newChat.contactsInChannel = {}
                newChat.subscribers = []
            }
            state.activeChat = newChat
        }
    }
}

export const deleteChatHandler = (state, action) => {
    const { chatId } = action.payload

    if (typeof chatId === "string") {
        // filter chats without chatId
        state.chats = state.chats.filter(chat => chat.chatId !== chatId)

        // if activeChat has chatId match then remove chatId
        const activeChat = state.activeChat
        if (activeChat && activeChat.chatId === chatId) {
            delete activeChat.chatId

            if (activeChat.chatType === "group")
                delete activeChat.membership
            else if (activeChat.chatType === "channel")
                delete activeChat.subscription
        }
    }
}

export const updateChatLastMessageHandler = (state, action) => {
    const { targetId, message, incrementUnread } = action.payload

    const targetChat = state.chats.find(chat => chat.targetId === targetId)
    const otherChats = state.chats.filter(chat => chat.targetId !== targetId)

    if (targetChat) {
        targetChat.lastMessage = message
        if (incrementUnread)
            targetChat.unreadMessages++
        state.chats = [targetChat, ...otherChats]
    }
}

export const setChatContactHandler = (state, action) => {
    const updatedContact = action.payload

    if (typeof updatedContact === "object") {
        // update chats list
        const chatToBeUpdated = state.chats.find(chat => chat.chatType === "private" && chat.targetId === updatedContact.targetUserId)
        if (chatToBeUpdated)
            chatToBeUpdated.contact = updatedContact

        // update active Chat if matches
        const activeChat = state.activeChat
        if (activeChat && activeChat.chatType === "private" && activeChat.targetId === updatedContact.targetUserId)
            activeChat.contact = updatedContact
    }
}

export const removeChatContactHandler = (state, action) => {
    const contactToBeRemoved = action.payload

    // update chats list
    const chatToBeUpdated = state.chats.find(chat => chat.chatType === "private" && chat.targetId === contactToBeRemoved.targetUserId)
    if (chatToBeUpdated)
        delete chatToBeUpdated.contact

    // update active Chat if matches
    const activeChat = state.activeChat
    if (activeChat && activeChat.chatType === "private" && activeChat.targetId === contactToBeRemoved.targetUserId)
        delete activeChat.contact
}

export const updateChatFlagHandler = (state, action) => {
    const { chatId, flagToBeModified, value } = action.payload
    if (typeof chatId === "string" && typeof flagToBeModified === "string") {
        const targetChat = state.chats.find(chat => chat.chatId === chatId)
        if (targetChat) {
            switch (flagToBeModified) {
                case "mute":
                    targetChat.isMuted = Boolean(value)
                    break
                case "archive":
                    targetChat.isArchived = Boolean(value)
                    break
                case "pin":
                    targetChat.isPinned = Boolean(value)
                    break
                default:
                    break
            }
        }

        const activeChat = state.activeChat
        if (activeChat && activeChat.chatId === chatId)
            state.activeChat = targetChat
    }
}

export const updateChatProfileHandler = (state, action) => {
    const { chatType, targetId, data } = action.payload
    const targetChat = state.chats.find(chat => chat.chatType === chatType && chat.targetId === targetId)
    const activeChat = state.activeChat
    if (targetChat && typeof data === "object") {
        switch (chatType) {
            case "group":
                targetChat.targetGroup = { ...targetChat.targetGroup, ...data }
                if (activeChat && activeChat.chatId === targetChat.chatId)
                    activeChat.targetGroup = { ...activeChat.targetGroup, ...data }
                break
            case "channel":
                targetChat.targetChannel = { ...targetChat.targetChannel, ...data }
                if (activeChat && activeChat.chatId === targetChat.chatId)
                    activeChat.targetChannel = { ...activeChat.targetChannel, ...data }
                break
            default:
                break
        }
    }
}

export const clearMembersHandler = (state) => {
    if (state.activeChat)
        state.activeChat.members = []
}

export const clearSubscribersHandler = (state) => {
    if (state.activeChat)
        state.activeChat.subscribers = []
}

export const updateAdminsHandler = (state, action) => {
    const { chatType, targetId, userIds, includesMe, areAdmins } = action.payload
    const targetChat = state.chats.find(chat => chat.chatType === chatType && chat.targetId === targetId)
    const activeChat = state.activeChat

    if (includesMe && targetChat) {
        if (chatType === "group")
            targetChat.targetGroup.membership.isAdmin = areAdmins
        else if (chatType === "channel")
            targetChat.targetChannel.subscription.isAdmin = areAdmins
    }

    if (activeChat && activeChat.chatType === chatType && activeChat.targetId === targetId) {
        if (chatType === "group") {
            if (includesMe)
                activeChat.targetGroup.membership.isAdmin = areAdmins

            userIds.forEach(userId => {
                const targetContactInGroup = activeChat.contactsInGroup[userId]
                if (targetContactInGroup)
                    targetContactInGroup.isAdmin = areAdmins

                const targetMember = activeChat.members.find(member => member.userId === userId)
                if (targetMember)
                    targetMember.isAdmin = areAdmins
            })
        } else if (chatType === "channel") {
            if (includesMe)
                activeChat.targetChannel.subscription.isAdmin = areAdmins

            userIds.forEach(userId => {
                const targetContactInChannel = activeChat.contactsInChannel[userId]
                if (targetContactInChannel)
                    targetContactInChannel.isAdmin = areAdmins

                const targetSubscriber = activeChat.subscribers.find(member => member.userId === userId)
                if (targetSubscriber)
                    targetSubscriber.isAdmin = areAdmins
            })
        }
    }
}
