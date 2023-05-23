import { createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { MessagesService } from "api/rest/services";
import { MessagingService } from "api/socket/services";


export const fetchMessages = createAsyncThunk("messages-reducer/fetchMessages", async (args, thunkApi) => {
    let { chatType, targetId, before, after } = args
    if (chatType && targetId) {

        if (!before)
            before = ""
        if (!after)
            after = ""

        const messages = await MessagesService.getMessages(chatType, targetId, before, after)
        return { messages, before, after }
    } else
        return []
})

export const sendMessage = createAsyncThunk("messages-reducer/sendMessage", ({ content, contentType }, thunkApi) => {
    const loggedUser = thunkApi.getState().app.loggedUser
    const activeChat = thunkApi.getState().chats.activeChat

    const message = {
        messageId: uuidv4(),
        isIdTemporary: true,
        senderId: loggedUser.userId,
        isSent: false,
        isReceived: false,
        isSeen: false,
        contentType,
        content,
        timestamp: new Date().toISOString()
    }

    switch (activeChat.chatType) {
        case "private":
            message.messageType = "private"
            message.receiverId = activeChat.targetId
            break
        case "group":
            message.messageType = "group"
            message.groupId = activeChat.targetId
            break
        case "channel":
            message.messageType = "channel"
            message.channelId = activeChat.targetId
            break
        default:
            break
    }

    MessagingService.sendMessage(message)

    return message
})

export const deleteMessages = createAsyncThunk("messages-reducer/deleteMessages", (args) => {
    const { chatType, targetId, messageIds } = args

    MessagingService.deleteMessages(chatType, targetId, messageIds)

    return { messageIds }
})
