import { createSlice } from "@reduxjs/toolkit";
import * as ActionHandlers from "./action-handlers";
import * as Thunks from "./thunks"
import * as ThunkHandlers from "./thunk-handlers"


const MessagesSlice = createSlice({
    name: "messages-reducer",
    initialState: {
        isMessagesBeingLoaded: false,
        messages: [],
        selectedMessagesCount: 0,
        isSelectionModeOn: false
    },
    reducers: {
        messageSent: ActionHandlers.messageSentHandler,
        addNewMessage: ActionHandlers.addNewMessageHandler,
        selectMessage: ActionHandlers.selectMessageHandler,
        deselectMessage: ActionHandlers.deselectMessageHandler,
        turnOnSelectionMode: ActionHandlers.turnOnSelectionModeHandler,
        turnOffSelectionMode: ActionHandlers.turnOffSelectionModeHandler,
        updateTargetReceived: ActionHandlers.updateTargetReceivedHandler,
        updateTargetSeen: ActionHandlers.updateTargetSeenHandler,
        deleteMessages: ActionHandlers.deleteMessagesHandler
    },
    extraReducers: (builder) => {
        builder.addCase(Thunks.fetchMessages.pending, ThunkHandlers.fetchMessagesPendingHandler)
        builder.addCase(Thunks.fetchMessages.fulfilled, ThunkHandlers.fetchMessagesFulfilledHandler)
        builder.addCase(Thunks.sendMessage.fulfilled, ThunkHandlers.sendMessageFulfilledHandler)
        builder.addCase(Thunks.deleteMessages.fulfilled, ThunkHandlers.deleteMessagesFulfilledHandler)
    }
})

export default MessagesSlice
