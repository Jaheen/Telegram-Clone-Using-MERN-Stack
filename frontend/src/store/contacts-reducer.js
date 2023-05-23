import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ContactsService } from "api/rest/services";

/**
 * async thunk action to fetch from service and update state
 */
export const fetchContacts = createAsyncThunk("contacts-reducer/fetchContacts", async () => {
    const contacts = await ContactsService.getMyContacts()
    return contacts
})

/**
 * Reducer to handle app preferences
 */
const ContactsReducer = createSlice({
    name: "contacts-reducer",
    initialState: {
        contacts: []
    },
    reducers: {
        addContact: (state, action) => {
            const newContact = action.payload
            const { contactId } = newContact
            const existingContact = state.contacts.find(contact => contact.contactId === contactId)
            if (!existingContact) {
                state.contacts.push(newContact)
                state.contacts = state.contacts.sort((contactA, contactB) => {
                    const fullNameA = contactA.firstName + " " + contactA.lastName
                    const fullNameB = contactB.firstName + " " + contactB.lastName
                    if (fullNameA < fullNameB)
                        return -1
                    else if (fullNameA > fullNameB)
                        return 1
                    else
                        return 0
                })
            }
        },
        updateContact: (state, action) => {
            const updatedContact = action.payload
            const { contactId } = updatedContact
            const targetContact = state.contacts.find(contact => contact.contactId === contactId)
            if (targetContact) {
                targetContact.firstName = updatedContact.firstName
                targetContact.lastName = updatedContact.lastName
            }
            state.contacts = state.contacts.sort((contactA, contactB) => {
                const fullNameA = contactA.firstName + " " + contactA.lastName
                const fullNameB = contactB.firstName + " " + contactB.lastName
                if (fullNameA < fullNameB)
                    return -1
                else if (fullNameA > fullNameB)
                    return 1
                else
                    return 0
            })
        },
        deleteContact: (state, action) => {
            const contactId = action.payload
            state.contacts = state.contacts.filter(contact => contact.contactId !== contactId)
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchContacts.fulfilled, (state, action) => {
            state.contacts = action.payload
            state.contacts = state.contacts.sort((contactA, contactB) => {
                const fullNameA = contactA.firstName + " " + contactA.lastName
                const fullNameB = contactB.firstName + " " + contactB.lastName
                if (fullNameA < fullNameB)
                    return -1
                else if (fullNameA > fullNameB)
                    return 1
                else
                    return 0
            })
        })
    }
})

export const { addContact, updateContact, deleteContact } = ContactsReducer.actions

export default ContactsReducer.reducer
