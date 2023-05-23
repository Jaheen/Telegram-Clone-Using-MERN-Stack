import Database from "database"
import { ObjectId, WithId } from "mongodb"

export interface Contact {
    userId: ObjectId
    firstName: string
    lastName?: string
    targetUserId: ObjectId
}

const UserLookup = {
    $lookup: {
        from: "Users",
        localField: "targetUserId",
        foreignField: "_id",
        as: "targetUser",
        pipeline: [
            {
                $addFields: {
                    userId: "$_id",
                    avatarText: {
                        $concat: [
                            { $substrBytes: ["$firstName", 0, 1] },
                            { $substrBytes: ["$lastName", 0, 1] }
                        ]
                    }
                }
            },
            { $project: { _id: 0, } }
        ]
    }
}
const ContactAddFields = {
    $addFields: {
        contactId: "$_id",
        avatarText: {
            $concat: [
                { $substrBytes: ["$firstName", 0, 1] },
                { $substrBytes: ["$lastName", 0, 1] }
            ]
        }
    }
}
const ContactProjection = {
    $project: { _id: 0 }
}

/**
 * Class to interact with 'Contacts' collection
 */
export default class Contacts {

    /**
     * Fetch all contacts of a particular user using user id in 'Contacts' collection
     * @param userId user id of the user who's contacts need to be fetched from database
     * @returns array of user's contacts
     */
    static async findAllContactsByUserId(userId: string): Promise<any> {
        return new Promise((resolve) => {
            const ContactsCollection = Database.getDatabase().collection<Contact>("Contacts")

            // fetch contacts with referenced user
            ContactsCollection.aggregate([
                { $match: { userId: new ObjectId(userId) } },
                UserLookup,
                { $unwind: "$targetUser" },
                ContactAddFields,
                ContactProjection
            ]).toArray().then(resolve).catch(console.log)
        })
    }

    /**
     * Create a new contact for a user that references another 
     * @param userId user id of user to whom newly created contact will belong to
     * @param firstName first name of the new contact
     * @param lastName last name of the new contact
     * @param targetUserId user id of the target user who's contact is this new contact referring to
     * @returns promise with result
     */
    static async createContact(userId: string, firstName: string, lastName: string, targetUserId: ObjectId): Promise<any> {
        return new Promise((resolve) => {
            const ContactsCollection = Database.getDatabase().collection<Contact>("Contacts")
            // insert a new contact
            ContactsCollection.insertOne({
                userId: new ObjectId(userId),
                firstName: firstName,
                lastName: lastName,
                targetUserId: targetUserId
            }).then(result => {
                if (result.acknowledged) {
                    ContactsCollection.aggregate([
                        { $match: { _id: result.insertedId } },
                        UserLookup,
                        { $unwind: "$targetUser" },
                        ContactAddFields,
                        ContactProjection
                    ]).toArray().then(result => resolve(result[0])).catch(console.log)
                }
            }).catch(console.log)
        })
    }

    /**
     * Check if a contact with target user alredy exists for a user
     * @param userId user id of user who owns the contact
     * @param targetUserId user id of target user who is being referenced
     * @returns a promise with boolean result
     */
    static async isContactWithTargetUserExists(userId: string, targetUserId: ObjectId): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const ContactsCollection = Database.getDatabase().collection<Contact>("Contacts")

            ContactsCollection.findOne({ userId: new ObjectId(userId), targetUserId: targetUserId })
                .then(contact => contact ? resolve(true) : resolve(false))
                .catch(console.log)
        })
    }

    /**
     * Get a contact of user that references another user
     * @param userId id of the user who owns the contact
     * @param targetUserId id of the user who is being referenced
     * @returns a promise containing the contact or null
     */
    static async getContact(userId: string, targetUserId: string): Promise<WithId<Contact>> {
        return new Promise((resolve, reject) => {
            const ContactsCollection = Database.getDatabase().collection<Contact>("Contacts")

            ContactsCollection.findOne(
                { userId: new ObjectId(userId), targetUserId: new ObjectId(targetUserId) }
            ).then(resolve).catch(console.log)
        })
    }

    static async updateContact(userId: string, contactId: string, firstName: string, lastName: string): Promise<WithId<Contact>> {
        return new Promise((resolve) => {
            const ContactsCollection = Database.getDatabase().collection<Contact>("Contacts")

            ContactsCollection.updateOne(
                { _id: new ObjectId(contactId), userId: new ObjectId(userId) },
                { $set: { firstName, lastName } }
            ).then(updateResult => {
                if (updateResult.acknowledged) {
                    ContactsCollection.findOne(
                        { _id: new ObjectId(contactId) }
                    ).then(resolve).catch(console.log)
                }
            }).catch(console.log)
        })
    }

    static async deleteContact(userId: string, contactId: string): Promise<void> {
        return new Promise((resolve) => {
            const ContactsCollection = Database.getDatabase().collection<Contact>("Contacts")

            ContactsCollection.deleteOne({ _id: new ObjectId(contactId), userId: new ObjectId(userId) })
                .then(deleteResult => {
                    if (deleteResult.acknowledged && deleteResult.deletedCount === 1)
                        resolve()
                }).catch(console.log)
        })
    }
}