import store from "store";
import { ChatsReducerActions } from "store/chats-reducer";


export default class ChatEventsHandler {

    /**
     * When flags of a chat is modified update store
     * @param {object} data data
     */
    static async onChatFlagModified(data) {
        const { chatId, flagToBeModified, value } = data
        store.dispatch(ChatsReducerActions.updateChatFlag({ chatId, flagToBeModified, value }))
    }

    /**
     * when new chat created event is emitted from server add the chat data to state
     * @param {object} chat object containing the newly created chat
     */
    static async onNewChatAdded(chat) {
        if (chat)
            store.dispatch(ChatsReducerActions.addChat(chat))
    }

    /**
     * When chat deleted event is emitted from the server remove it from the state using chatId
     * @param {object} data object containing chatId and other parameters
     */
    static async onChatDeleted(data) {
        const { chatId } = data
        if (typeof chatId === "string")
            store.dispatch(ChatsReducerActions.deleteChat({ chatId }))
    }

    // Group Specific Handlers

    /**
     * When user is removed from the group find respective chat and delete it
     * @param {object} data object containing groupId
     */
    static async onRemovedFromGroup(data) {
        const { groupId } = data
        const chat = store.getState().chats.chats.find(chat => chat.chatType === "group" && chat.targetId === groupId)
        if (chat) {
            const chatId = chat.chatId
            store.dispatch(ChatsReducerActions.deleteChat({ chatId }))
        }
    }

    static async onGroupMembersCountChanged(data) {
        const { groupId, membersCount } = data
        store.dispatch(ChatsReducerActions.updateChatProfile({ chatType: "group", targetId: groupId, data: { membersCount } }))
    }

    static async onGroupAdminPrivilegesAdded(data) {
        const { groupId, userIds } = data
        const loggedUserId = store.getState().app.loggedUser.userId
        let includesMe = false

        if (userIds instanceof Array)
            includesMe = userIds.includes(loggedUserId)

        store.dispatch(ChatsReducerActions.updateAdmins({ chatType: "group", targetId: groupId, userIds, includesMe, areAdmins: true }))
    }

    static async onGroupAdminPrivilegesRemoved(data) {
        const { groupId, userIds } = data
        const loggedUserId = store.getState().app.loggedUser.userId
        let includesMe = false

        if (userIds instanceof Array)
            includesMe = userIds.includes(loggedUserId)

        store.dispatch(ChatsReducerActions.updateAdmins({ chatType: "group", targetId: groupId, userIds, includesMe, areAdmins: false }))
    }

    /**
     * When the group prifile is modified by the admin update store
     * @param {object} data data
     */
    static async onGroupProfileUpdated(data) {
        const { groupId, groupName, groupDescription, avatarUrl } = data

        if (typeof groupId === "string" && groupId.trim() !== "")
            store.dispatch(ChatsReducerActions.updateChatProfile({ chatType: "group", targetId: groupId, data: { groupName, groupDescription, avatarUrl } }))
    }

    // Channel Specific Handlers

    static async onRemovedFromChannel(data) {
        const { channelId } = data
        const chat = store.getState().chats.chats.find(chat => chat.chatType === "channel" && chat.targetId === channelId)
        if (chat) {
            const chatId = chat.chatId
            store.dispatch(ChatsReducerActions.deleteChat({ chatId }))
        }
    }

    static async onChannelSubscribersCountChanged(data) {
        const { channelId, subscribersCount } = data
        store.dispatch(ChatsReducerActions.updateChatProfile({ chatType: "channel", targetId: channelId, data: { subscribersCount } }))
    }

    static async onChannelAdminPrivilegesAdded(data) {
        const { channelId, userIds } = data
        const loggedUserId = store.getState().app.loggedUser.userId
        let includesMe = false

        if (userIds instanceof Array)
            includesMe = userIds.includes(loggedUserId)

        store.dispatch(ChatsReducerActions.updateAdmins({ chatType: "channel", targetId: channelId, userIds, includesMe, areAdmins: true }))
    }

    static async onChannelAdminPrivilegesRemoved(data) {
        const { channelId, userIds } = data
        const loggedUserId = store.getState().app.loggedUser.userId
        let includesMe = false

        if (userIds instanceof Array)
            includesMe = userIds.includes(loggedUserId)

        store.dispatch(ChatsReducerActions.updateAdmins({ chatType: "channel", targetId: channelId, userIds, includesMe, areAdmins: false }))
    }

    static async onChannelProfileUpdated(data) {
        const { channelId, channelName, channelDescription, avatarUrl } = data

        if (typeof channelId === "string" && channelId.trim() !== "")
            store.dispatch(ChatsReducerActions.updateChatProfile({ chatType: "channel", targetId: channelId, data: { channelName, channelDescription, avatarUrl } }))
    }
}