import { Router } from "express";
import { json } from "body-parser";
import {
    ChannelsController,
    ChatsController,
    ContactsController,
    GroupsController,
    MessagesController,
    ProfileController,
    SearchController
} from "controllers/rest";
import { APIAuthMiddleware } from "middlewares";

const APIRouter = Router()

APIRouter.use(json())
APIRouter.use(APIAuthMiddleware)

// Search Routes
APIRouter.get("/search", SearchController.search)

// Chats Routes
APIRouter.get("/chats/get-my-chats", ChatsController.getMyChats)
APIRouter.get("/chats/get-chat-data/:chatType/:targetId", ChatsController.getChatData)

// Contacts Routes
APIRouter.get("/contacts/get-my-contacts", ContactsController.getMyContacts)
APIRouter.post("/contacts/create-contact", ContactsController.createContact)
APIRouter.delete("/contacts/delete-contact/:contactId", ContactsController.deleteContact)
APIRouter.put("/contacts/update-contact", ContactsController.updateContact)

// Profile Routes
APIRouter.get("/profiles/get-user-profile/:targetUserId", ProfileController.getUserProfile)
APIRouter.get("/profiles/get-my-profile/", ProfileController.getMyProfile)
APIRouter.post("/profiles/is-username-available", ProfileController.isUsernameAvailable)
APIRouter.put("/profiles/update-profile", ProfileController.updateProfile)

// Group Routes
APIRouter.get("/groups/get-my-contacts-in-group/:groupId", GroupsController.getMyContactsInGroup)
APIRouter.get("/groups/get-members/:groupId", GroupsController.getMembers)

// Channel Routes
APIRouter.get("/channels/get-my-contacts-in-channel/:channelId", ChannelsController.getMyContactsInChannel)
APIRouter.get("/channels/get-subscribers/:channelId", ChannelsController.getSubscribers)

// Messages Routes
APIRouter.get("/messages/get-messages/:chatType/:targetId", MessagesController.getMessages)

export default APIRouter
