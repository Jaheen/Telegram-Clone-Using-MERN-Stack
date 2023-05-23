import * as ActionHandlers from "./action-handlers";


export const setActiveChatFulfilledHandler = (state, action) => {
    const chat = action.payload

    if (chat) {
        if (chat.chatType === "group") {
            chat.contactsInGroup = {}
            chat.members = []
        }
        if (chat.chatType === "channel") {
            chat.contactsInChannel = {}
            chat.subscribers = []
        }
    }

    state.activeChat = chat
}

export const setChatFlagFulfilledHandler = (state, action) => ActionHandlers.updateChatFlagHandler(state, action)

export const deleteChatFulfilledHandler = (state, action) => ActionHandlers.deleteChatHandler(state, action)

// Group specific thunk handlers

export const updateGroupProfileFulfilledHandler = (state, action) => {
    const { groupId, groupName, groupDescription, avatarUrl } = action.payload
    
    ActionHandlers.updateChatProfileHandler(state, { payload: { chatType: "group", targetId: groupId, data: { groupName, groupDescription, avatarUrl } } })
}

export const fetchContactsInGroupFulfilledHandler = (state, action) => {
    const contactsInGroup = action.payload
    if (contactsInGroup && state.activeChat) {
        state.activeChat.contactsInGroup = contactsInGroup
    }
}

export const fetchMembersOfGroupFulfilledHandler = (state, action) => {
    const { members, replace } = action.payload

    if (state.activeChat) {
        if (replace) {
            state.activeChat.members = members
        } else {
            state.activeChat.members.push(...members)
        }
    }
}

export const addMembersToGroupFulfilledHandler = (state, action) => {
    const { groupId, newMembersCount } = action.payload

    ActionHandlers.updateChatProfileHandler(state, { payload: { chatType: "group", targetId: groupId, data: { membersCount: newMembersCount } } })
}

export const removeMembersFromGroupFulfilledHandler = (state, action) => {
    const { groupId, newMembersCount, userIds } = action.payload

    if (state.activeChat && userIds instanceof Array) {
        state.activeChat.members = state.activeChat.members.filter(member => !userIds.includes(member.userId))
        userIds.forEach(userId => delete state.activeChat.contactsInGroup[userId])
    }

    ActionHandlers.updateChatProfileHandler(state, { payload: { chatType: "group", targetId: groupId, data: { membersCount: newMembersCount } } })
}

export const grantGroupAdminPrivilegesFulfilledHandler = (state, action) => {
    const { userIds } = action.payload

    if (state.activeChat && userIds instanceof Array) {
        userIds.forEach(userId => {
            state.activeChat.contactsInGroup[userId].isAdmin = true
            const member = state.activeChat.members.find(member => member.userId === userId)
            if (member)
                member.isAdmin = true
        })
    }
}

export const revokeGroupAdminPrivilegesFulfilledHandler = (state, action) => {
    const { userIds } = action.payload

    if (state.activeChat && userIds instanceof Array) {
        userIds.forEach(userId => {
            state.activeChat.contactsInGroup[userId].isAdmin = false
            const member = state.activeChat.members.find(member => member.userId === userId)
            if (member)
                member.isAdmin = false
        })
    }
}

export const leaveGroupFulfilledHandler = (state, action) => ActionHandlers.deleteChatHandler(state, action)

// Channel specific thunk handlers

export const updateChannelProfileFulfilledHandler = (state, action) => {
    const { channelId, channelName, channelDescription, avatarUrl } = action.payload

    ActionHandlers.updateChatProfileHandler(state, { payload: { chatType: "channel", targetId: channelId, data: { channelName, channelDescription, avatarUrl } } })
}

export const fetchContactsInChannelFulfilledHandler = (state, action) => {
    const contactsInChannel = action.payload
    if (contactsInChannel && state.activeChat) {
        state.activeChat.contactsInChannel = contactsInChannel
    }
}

export const fetchSubscribersOfChannelFulfilledHandler = (state, action) => {
    const { subscribers, replace } = action.payload

    if (state.activeChat) {
        if (replace) {
            state.activeChat.subscribers = subscribers
        } else {
            state.activeChat.subscribers.push(...subscribers)
        }
    }
}

export const addSubscribersToChannelFulfilledHandler = (state, action) => {
    const { channelId, newSubscribersCount } = action.payload

    ActionHandlers.updateChatProfileHandler(state, { payload: { chatType: "channel", targetId: channelId, data: { subscribersCount: newSubscribersCount } } })
}

export const removeSubscribersFromChannelFulfilledHandler = (state, action) => {
    const { channelId, newSubscribersCount, userIds } = action.payload

    if (state.activeChat && userIds instanceof Array) {
        state.activeChat.subscribers = state.activeChat.subscribers.filter(subscriber => !userIds.includes(subscriber.userId))
        userIds.forEach(userId => delete state.activeChat.contactsInChannel[userId])
    }

    ActionHandlers.updateChatProfileHandler(state, { payload: { chatType: "channel", targetId: channelId, data: { subscribersCount: newSubscribersCount } } })
}

export const grantChannelAdminPrivilegesFulfilledHandler = (state, action) => {
    const { userIds } = action.payload

    if (state.activeChat && userIds instanceof Array) {
        userIds.forEach(userId => {
            state.activeChat.contactsInChannel[userId].isAdmin = true
            const subscriber = state.activeChat.subscribers.find(subscriber => subscriber.userId === userId)
            if (subscriber)
                subscriber.isAdmin = true
        })
    }
}

export const revokeChannelAdminPrivilegesFulfilledHandler = (state, action) => {
    const { userIds } = action.payload

    if (state.activeChat && userIds instanceof Array) {
        userIds.forEach(userId => {
            state.activeChat.contactsInChannel[userId].isAdmin = false
            const subscriber = state.activeChat.subscribers.find(subscriber => subscriber.userId === userId)
            if (subscriber)
                subscriber.isAdmin = false
        })
    }
}

export const leaveChannelFulfilledHandler = (state, action) => ActionHandlers.deleteChatHandler(state, action)