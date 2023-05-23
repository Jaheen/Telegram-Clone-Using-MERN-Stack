import store from "store"
import { ChatsReducerActions } from "store/chats-reducer"
import { addContact, deleteContact, updateContact } from "store/contacts-reducer"

export default class ContactEventsHandler {

    static onContactCreated(createdContact) {
        store.dispatch(ChatsReducerActions.setChatContact(createdContact))
        store.dispatch(addContact(createdContact))
    }

    static onContactUpdated(updatedContact) {
        store.dispatch(ChatsReducerActions.setChatContact(updatedContact))
        store.dispatch(updateContact(updatedContact))
    }

    static onContactDeleted(data) {
        const { contactId } = data
        const targetContact = store.getState().contacts.contacts.find(contact => contact.contactId === contactId)
        if (targetContact) {
            store.dispatch(ChatsReducerActions.removeChatContact(targetContact))
            store.dispatch(deleteContact(contactId))
        }
    }
}