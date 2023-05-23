import { configureStore } from "@reduxjs/toolkit";
import AppReducer from "./app-reducer"
import ChatsReducer from "./chats-reducer";
import ContactsReducer from "./contacts-reducer";
import MessagesReducer from "./messages-reducer";


/**
 * Export the redux store
 */
export default configureStore({
    reducer: {
        app: AppReducer,
        chats: ChatsReducer,
        messages: MessagesReducer,
        contacts: ContactsReducer
    }
})
