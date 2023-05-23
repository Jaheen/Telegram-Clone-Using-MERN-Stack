import store from "store";
import { ChatsReducerActions } from "store/chats-reducer";
import { MessagesReducerActions } from "store/messages-reducer";

export default class MessageEventsHandler {

    /**
     * Handler for message sent emitted by socket after user's message reaches server and database is updated
     * @param {object} data data containing the temporary id and created message
     */
    static async onMessageSent(data) {
        store.dispatch(MessagesReducerActions.messageSent(data))

        const { createdMessage } = data

        switch (createdMessage.messageType) {
            case "private":
                store.dispatch(ChatsReducerActions.updateChatLastMessage({ targetId: createdMessage.receiverId, message: createdMessage }))
                break
            case "group":
                store.dispatch(ChatsReducerActions.updateChatLastMessage({ targetId: createdMessage.groupId, message: createdMessage }))
                break
            case "channel":
                store.dispatch(ChatsReducerActions.updateChatLastMessage({ targetId: createdMessage.channelId, message: createdMessage }))
                break
            default:
                break
        }
    }

    /**
     * Handler for message arrived socket event 
     * @param {object} message data object containing the message
     */
    static async onMessageArrived(message) {
        const { messageType, senderId, groupId, channelId } = message

        let targetId
        switch (messageType) {
            case "private":
                targetId = senderId
                break
            case "group":
                targetId = groupId
                break
            case "channel":
                targetId = channelId
                break
            default:
                break
        }

        if (targetId) {
            const activeChat = store.getState().chats.activeChat
            if (activeChat && activeChat.chatType === messageType && activeChat.targetId === targetId) {
                store.dispatch(ChatsReducerActions.updateChatLastMessage({ targetId, message, incrementUnread: false }))
                store.dispatch(MessagesReducerActions.addNewMessage(message))
            } else {
                store.dispatch(ChatsReducerActions.updateChatLastMessage({ targetId, message, incrementUnread: true }))
            }
        }
    }

    static async onMessagesReceivedByTarget(data) {
        const { chatType, targetId, messageIds } = data

        const activeChat = store.getState().chats.activeChat
        if (activeChat && activeChat.chatType === chatType && activeChat.targetId === targetId)
            if (messageIds instanceof Array)
                store.dispatch(MessagesReducerActions.updateTargetReceived({ messageIds }))
    }

    static async onMessagesSeenByTarget(data) {
        const { chatType, targetId, messageIds } = data

        const activeChat = store.getState().chats.activeChat
        if (activeChat && activeChat.chatType === chatType && activeChat.targetId === targetId)
            if (messageIds instanceof Array)
                store.dispatch(MessagesReducerActions.updateTargetSeen({ messageIds }))
    }

    static async onMessagesDeleted(data) {
        const { chatType, targetId, messageIds } = data

        const activeChat = store.getState().chats.activeChat

        console.log(data)

        if (activeChat && activeChat.chatType === chatType && activeChat.targetId === targetId) {
            store.dispatch(MessagesReducerActions.deleteMessages({ messageIds }))
        }
    }
}