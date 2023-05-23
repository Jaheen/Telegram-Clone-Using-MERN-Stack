import { Contacts, Users } from "models";

/**
 * Service Class to perform operations regarding contacts data
 */
export default class ContactsService {
    /**
     * Service Method to fetch all contacts of a particular user
     * @param userId user id of the user who's contacts need to be fetched
     */
    static getContacts(userId: string) {
        return Contacts.findAllContactsByUserId(userId)
    }

    /**
     * Service method to create contact in database for logged in user referencing the target user with phone number
     * @param userId user id of logged in user
     * @param firstName first name of new contact
     * @param lastName last name of new contact
     * @param phoneNumber phone number of the target user
     * @returns promise containing newly created contact or error reason
     */
    static async createContact(userId: string, firstName: string, lastName: string, phoneNumber: string) {
        return new Promise((resolve, reject) => {
            Users.findUserByPhoneNumber(phoneNumber)
                .then(targetUser => {

                    if (targetUser) {
                        if (targetUser._id.toString() === userId)
                            reject("number-belongs-to-you")
                        else
                            Contacts.isContactWithTargetUserExists(userId, targetUser._id).then(exists => {
                                if (exists)
                                    reject("contact-already-exists")
                                else
                                    Contacts.createContact(userId, firstName, lastName, targetUser._id)
                                        .then(newContact => resolve(newContact))
                            })
                    } else
                        reject("phone-number-not-exists")
                })
        })
    }

    static async updateContact(userId: string, contactId: string, firstName: string, lastName: string) {
        return new Promise((resolve) => {
            Contacts.updateContact(userId, contactId, firstName, lastName).then(updatedContact => {
                if (updatedContact) {
                    updatedContact["contactId"] = updatedContact._id
                    delete updatedContact._id
                    updatedContact["avatarText"] = updatedContact.firstName.substring(0, 1)
                    if (updatedContact.lastName)
                        updatedContact["avatarText"] += updatedContact.lastName.substring(0, 1)

                    resolve(updatedContact)
                }
            })
        })
    }

    static async deleteContact(userId: string, contactId: string) {
        return Contacts.deleteContact(userId, contactId)
    }
}