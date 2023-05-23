import { createSlice } from "@reduxjs/toolkit";
import * as ActionHandlers from "./action-handlers";
import * as Thunks from "./thunks"
import * as ThunkHandlers from "./thunk-handlers"
import ChatDataUtils from "utils/chat-data-utils";


const ChatsSlice = createSlice({
    name: "chats-reducer",
    initialState: {
        isLoading: false,
        chats: [],
        activeChat: null
    },
    reducers: {
        addChat: ActionHandlers.addChatHandler,
        deleteChat: ActionHandlers.deleteChatHandler,
        updateChatLastMessage: ActionHandlers.updateChatLastMessageHandler,
        setChatContact: ActionHandlers.setChatContactHandler,
        removeChatContact: ActionHandlers.removeChatContactHandler,
        updateChatFlag: ActionHandlers.updateChatFlagHandler,
        updateChatProfile: ActionHandlers.updateChatProfileHandler,
        clearMembers: ActionHandlers.clearMembersHandler,
        clearSubscribers: ActionHandlers.clearSubscribersHandler,
        updateAdmins: ActionHandlers.updateAdminsHandler
    },
    extraReducers: (builder) => {
        builder.addCase(Thunks.fetchRecentChats.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(Thunks.fetchRecentChats.fulfilled, (state, action) => {
            const chats = action.payload
            if (chats instanceof Array) {
                state.isLoading = false
                state.chats = chats.map(chat => ChatDataUtils.formatChatData(chat))
            }
        })

        builder.addCase(Thunks.setActiveChat.pending, (state) => { state.activeChat = null })
        builder.addCase(Thunks.setActiveChat.fulfilled, ThunkHandlers.setActiveChatFulfilledHandler)

        builder.addCase(Thunks.deleteChat.fulfilled, ThunkHandlers.deleteChatFulfilledHandler)
        builder.addCase(Thunks.setChatFlag.fulfilled, ThunkHandlers.setChatFlagFulfilledHandler)

        builder.addCase(Thunks.updateGroupProfile.fulfilled, ThunkHandlers.updateGroupProfileFulfilledHandler)
        builder.addCase(Thunks.fetchContactsInGroup.fulfilled, ThunkHandlers.fetchContactsInGroupFulfilledHandler)
        builder.addCase(Thunks.fetchMembersOfGroup.fulfilled, ThunkHandlers.fetchMembersOfGroupFulfilledHandler)
        builder.addCase(Thunks.addMembersToGroup.fulfilled, ThunkHandlers.addMembersToGroupFulfilledHandler)
        builder.addCase(Thunks.removeMembersFromGroup.fulfilled, ThunkHandlers.removeMembersFromGroupFulfilledHandler)
        builder.addCase(Thunks.grantGroupAdminPrivileges.fulfilled, ThunkHandlers.grantGroupAdminPrivilegesFulfilledHandler)
        builder.addCase(Thunks.revokeGroupAdminPrivileges.fulfilled, ThunkHandlers.revokeGroupAdminPrivilegesFulfilledHandler)
        builder.addCase(Thunks.leaveGroup.fulfilled, ThunkHandlers.leaveGroupFulfilledHandler)

        builder.addCase(Thunks.updateChannelProfile.fulfilled, ThunkHandlers.updateChannelProfileFulfilledHandler)
        builder.addCase(Thunks.fetchContactsInChannel.fulfilled, ThunkHandlers.fetchContactsInChannelFulfilledHandler)
        builder.addCase(Thunks.fetchSubscribersOfChannel.fulfilled, ThunkHandlers.fetchSubscribersOfChannelFulfilledHandler)
        builder.addCase(Thunks.addSubscribersToChannel.fulfilled, ThunkHandlers.addSubscribersToChannelFulfilledHandler)
        builder.addCase(Thunks.removeSubscribersFromChannel.fulfilled, ThunkHandlers.removeSubscribersFromChannelFulfilledHandler)
        builder.addCase(Thunks.grantChannelAdminPrivileges.fulfilled, ThunkHandlers.grantChannelAdminPrivilegesFulfilledHandler)
        builder.addCase(Thunks.revokeChannelAdminPrivileges.fulfilled, ThunkHandlers.revokeChannelAdminPrivilegesFulfilledHandler)
        builder.addCase(Thunks.leaveChannel.fulfilled, ThunkHandlers.leaveChannelFulfilledHandler)
    }
})

export default ChatsSlice