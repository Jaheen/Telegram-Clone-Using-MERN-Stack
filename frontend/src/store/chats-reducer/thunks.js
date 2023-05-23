import { createAsyncThunk } from "@reduxjs/toolkit";
import { ChannelsService as ChannelsRestService, ChatsService as ChatsRestService, GroupsService as GroupsRestService } from "api/rest/services";
import { ChannelsService as ChannelsSocketService, ChatsService as ChatsSocketService, GroupsService as GroupsSocketService } from "api/socket/services";


/**
 * Thunk to fetch recent chats of logged user
 */
export const fetchRecentChats = createAsyncThunk("chats-reducer/fetchRecentChats", async () => {
    const chats = await ChatsRestService.getMyChats()
    return chats
})

/**
 * Thunk to fetch and set chat based on chattype and targetid
 */
export const setActiveChat = createAsyncThunk("chats-reducer/setActiveChat", async ({ chatType, targetId }, thunkApi) => {
    if (chatType && targetId) {
        try {
            const chat = await ChatsRestService.getChatData(chatType, targetId)
            return chat
        } catch (reason) {
            return thunkApi.rejectWithValue(reason)
        }
    } else
        return null
})

/**
 * Thunk to set chat flags like mute, pin, archive for a chat
 */
export const setChatFlag = createAsyncThunk("chats-reducer/setChatFlag", (args) => {
    const { chatId, flagToBeModified, value } = args

    ChatsSocketService.setChatFlag(chatId, flagToBeModified, value)

    return { chatId, flagToBeModified, value }
})

// Group specific thunks

/**
 * Thunk to update group profile
 */
export const updateGroupProfile = createAsyncThunk("chats-reducer/updateGroupProfile", (args, thunkApi) => {
    const { groupName, groupDescription, avatarUrl } = args

    const groupId = thunkApi.getState().chats.activeChat.targetGroup.groupId

    GroupsSocketService.updateGroupProfile(groupId, groupName, groupDescription, avatarUrl)

    return { groupId, groupName, groupDescription, avatarUrl }
})

/**
 * Thunk to fetch user's contacts in a group
 */
export const fetchContactsInGroup = createAsyncThunk("chats-reducer/fetchContactsInGroup", async (_, thunkApi) => {
    const groupId = thunkApi.getState().chats.activeChat.targetGroup.groupId

    const contactsInGroup = await GroupsRestService.getContactsInGroup(groupId)

    return contactsInGroup
})

/**
 * Thunk to fetch the member profile with search and pagination and update state accordingly
 */
export const fetchMembersOfGroup = createAsyncThunk("chats-reducer/fetchMembersOfGroup", async (args, thunkApi) => {
    const { query, replace } = args

    const groupId = thunkApi.getState().chats.activeChat.targetGroup.groupId
    let offset = thunkApi.getState().chats.activeChat.members.length

    if (replace)
        offset = 0

    const members = await GroupsRestService.getMembersOfGroup(groupId, query, offset)

    return { members, replace }
})

/**
 * Thunk to add users as members of a group
 */
export const addMembersToGroup = createAsyncThunk("chats-reducer/addMembersToGroup", async (args, thunkApi) => {
    const { userIds } = args

    const groupId = thunkApi.getState().chats.activeChat.targetGroup.groupId

    const { membersCount } = await GroupsSocketService.addMembers(groupId, userIds)

    return { groupId, newMembersCount: membersCount, userIds }
})

/**
 * Thunk to remove users from members list of a group
 */
export const removeMembersFromGroup = createAsyncThunk("chats-reducer/removeMembersFromGroup", async (args, thunkApi) => {
    const { userIds } = args

    const groupId = thunkApi.getState().chats.activeChat.targetGroup.groupId

    const { membersCount } = await GroupsSocketService.removeMembers(groupId, userIds)

    return { groupId, newMembersCount: membersCount, userIds }
})

/**
 * Thunk to make existing members as admins of the group
 */
export const grantGroupAdminPrivileges = createAsyncThunk("chats-reducer/grantGroupAdminPrivileges", async (args, thunkApi) => {
    const { userIds } = args

    const groupId = thunkApi.getState().chats.activeChat.targetGroup.groupId

    GroupsSocketService.grantAdminPrivileges(groupId, userIds)

    return { groupId, userIds }
})

/**
 * Thunk to remove admin privileges of users in a group
 */
export const revokeGroupAdminPrivileges = createAsyncThunk("chats-reducer/revokeGroupAdminPrivileges", async (args, thunkApi) => {
    const { userIds } = args

    const groupId = thunkApi.getState().chats.activeChat.targetGroup.groupId

    GroupsSocketService.revokeAdminPrivileges(groupId, userIds)

    return { groupId, userIds }
})

// Channel specific thunks

/**
 * Thunk to update channel profile
 */
export const updateChannelProfile = createAsyncThunk("chats-reducer/updateChannelProfile", (args, thunkApi) => {
    const { channelName, channelDescription, avatarUrl } = args

    const channelId = thunkApi.getState().chats.activeChat.targetChannel.channelId

    ChannelsSocketService.updateChannelProfile(channelId, channelName, channelDescription, avatarUrl)

    return { channelId, channelName, channelDescription, avatarUrl }
})

/**
 * Thunk to fetch user's contacts who are already in the channel
 */
export const fetchContactsInChannel = createAsyncThunk("chats-reducer/fetchContactsInChannel", async (_, thunkApi) => {
    const channelId = thunkApi.getState().chats.activeChat.targetChannel.channelId

    const contactsInChannel = await ChannelsRestService.getContactsInChannel(channelId)

    return contactsInChannel
})

/**
 * Thunk to fetch all subscribers of the channel
 */
export const fetchSubscribersOfChannel = createAsyncThunk("chats-reducer/fetchSubscribersOfChannel", async (args, thunkApi) => {
    const { query, replace } = args

    const channelId = thunkApi.getState().chats.activeChat.targetChannel.channelId
    let offset = thunkApi.getState().chats.activeChat.subscribers.length

    if (replace)
        offset = 0

    const subscribers = await ChannelsRestService.getSubscribersOfChannel(channelId, query, offset)

    return { subscribers, replace }
})

/**
 * Thunk to add users as subscribers of the channel
 */
export const addSubscribersToChannel = createAsyncThunk("chats-reducer/addSubscribersToChannel", async (args, thunkApi) => {
    const { userIds } = args

    const channelId = thunkApi.getState().chats.activeChat.targetChannel.channelId

    const { subscribersCount } = await ChannelsSocketService.addSubscribers(channelId, userIds)

    return { channelId, newSubscribersCount: subscribersCount, userIds }
})

/**
 * Thunk to remove subscribers from the channel
 */
export const removeSubscribersFromChannel = createAsyncThunk("chats-reducer/removeSubscribersToChannel", async (args, thunkApi) => {
    const { userIds } = args

    const channelId = thunkApi.getState().chats.activeChat.targetChannel.channelId

    const { subscribersCount } = await ChannelsSocketService.removeSubscribers(channelId, userIds)

    return { channelId, newSubscribersCount: subscribersCount, userIds }
})

/**
 * Thunk to make existing subscribers as admins of the channel
 */
export const grantChannelAdminPrivileges = createAsyncThunk("chats-reducer/grantChannelAdminPrivileges", async (args, thunkApi) => {
    const { userIds } = args

    const channelId = thunkApi.getState().chats.activeChat.targetChannel.channelId

    ChannelsSocketService.grantAdminPrivileges(channelId, userIds)

    return { channelId, userIds }
})

/**
 * Thunk to revoke admin privileges of users in a channel
 */
export const revokeChannelAdminPrivileges = createAsyncThunk("chats-reducer/revokeChannelAdminPrivileges", async (args, thunkApi) => {
    const { userIds } = args

    const channelId = thunkApi.getState().chats.activeChat.targetChannel.channelId

    ChannelsSocketService.revokeAdminPrivileges(channelId, userIds)

    return { channelId, userIds }
})

/**
 * Thunk to delete private chat
 */
export const deleteChat = createAsyncThunk("chats-reducer/deleteChat", (args) => {
    const { chatId, targetUserId } = args

    ChatsSocketService.deleteChat(chatId, targetUserId)

    return { chatId, targetUserId }
})

/**
 * Thunk to delete group chat and leave group
 */
export const leaveGroup = createAsyncThunk("chats-reducer/leaveGroup", (args) => {
    const { chatId, groupId } = args

    GroupsSocketService.leaveGroup(chatId, groupId)

    return { chatId, groupId }
})

/**
 * Thunk to delete channel chat and leave channel
 */
export const leaveChannel = createAsyncThunk("chats-reducer/leaveChannel", (args) => {
    const { chatId, channelId } = args

    ChannelsSocketService.leaveChannel(chatId, channelId)

    return { chatId, channelId }
})
