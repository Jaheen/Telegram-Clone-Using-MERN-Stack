import { initializeSocketInstance, socket } from "./socket";
import { ChatEventsHandler, ContactEventsHandler, MessageEventsHandler } from "./handlers";


export default function initializeSocketIO() {

    initializeSocketInstance()

    // initialize listeners here
    socket.on("connect", () => {
        console.log(`Connected to server and socket id is => ${socket.id}`)
    });

    socket.on("disconnect", (reason) => {
        console.log(reason)
    });

    // contact events
    socket.on("contact-created", ContactEventsHandler.onContactCreated)
    socket.on("contact-updated", ContactEventsHandler.onContactUpdated)
    socket.on("contact-deleted", ContactEventsHandler.onContactDeleted)

    // common chat events
    socket.on("chat-flag-modified", ChatEventsHandler.onChatFlagModified)

    // private chat events
    socket.on("new-chat-added", ChatEventsHandler.onNewChatAdded)
    socket.on("chat-deleted", ChatEventsHandler.onChatDeleted)

    // channel events
    socket.on("new-channel-created", ChatEventsHandler.onNewChatAdded)
    socket.on("subscribed-to-channel", ChatEventsHandler.onNewChatAdded)
    socket.on("channel-profile-updated", ChatEventsHandler.onChannelProfileUpdated)
    socket.on("removed-from-channel", ChatEventsHandler.onRemovedFromChannel)
    socket.on("channel-subscribers-count-changed", ChatEventsHandler.onChannelSubscribersCountChanged)
    socket.on("channel-admin-privileges-added", ChatEventsHandler.onChannelAdminPrivilegesAdded)
    socket.on("channel-admin-privileges-removed", ChatEventsHandler.onChannelAdminPrivilegesRemoved)
    socket.on("left-channel", ChatEventsHandler.onChatDeleted)

    // group events
    socket.on("new-group-created", ChatEventsHandler.onNewChatAdded)
    socket.on("joined-group", ChatEventsHandler.onNewChatAdded)
    socket.on("group-profile-updated", ChatEventsHandler.onGroupProfileUpdated)
    socket.on("removed-from-group", ChatEventsHandler.onRemovedFromGroup)
    socket.on("group-members-count-changed", ChatEventsHandler.onGroupMembersCountChanged)
    socket.on("group-admin-privileges-added", ChatEventsHandler.onGroupAdminPrivilegesAdded)
    socket.on("group-admin-privileges-removed", ChatEventsHandler.onGroupAdminPrivilegesRemoved)
    socket.on("left-group", ChatEventsHandler.onChatDeleted)

    // message events
    socket.on("message-sent", MessageEventsHandler.onMessageSent)
    socket.on("message-arrived", MessageEventsHandler.onMessageArrived)
    socket.on("messages-received-by-target", MessageEventsHandler.onMessagesReceivedByTarget)
    socket.on("messages-seen-by-target", MessageEventsHandler.onMessagesSeenByTarget)
    socket.on("messages-deleted", MessageEventsHandler.onMessagesDeleted)

    socket.connect()
}