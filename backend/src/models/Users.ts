import Database from "database"
import { InsertOneResult, ObjectId, WithId } from "mongodb"

export interface User {
    firstName: string
    lastName: string
    bio: string
    phoneNumber: string
    avatarUrl: string
}

/**
 * Class to interact with 'Users' collection in the database
 */
export default class Users {

    /**
     * Find user by id in 'Users' collection
     * @param userId user id of target user
     * @returns promise containing user if exists or null if not exists
     */
    static async findUserById(userId: string): Promise<WithId<User>> {
        return new Promise((resolve, reject) => {

            const UsersCollection = Database.getDatabase().collection<User>("Users")
            // find user by object id
            UsersCollection.findOne({ _id: new ObjectId(userId) }).then(resolve).catch(console.log)
        })
    }

    /**
     * Find user in 'Users' collection using phone number
     * @param phoneNumber phone number of the user that needed to be found
     * @returns A promise with user or null
     */
    static async findUserByPhoneNumber(phoneNumber: string): Promise<WithId<User>> {
        return new Promise((resolve, reject) => {

            const UsersCollection = Database.getDatabase().collection<User>("Users")
            // find user using phone number and resolve user
            UsersCollection.findOne({ phoneNumber })
                .then(resolve).catch(console.log)
        })
    }

    /**
     * Create a new user with provided phone number
     * @param phoneNumber phone number to be inserted
     * @returns a promise that contains result
     */
    static async createUserWithPhoneNumber(phoneNumber: string): Promise<InsertOneResult<User>> {
        return new Promise((resolve, reject) => {

            const UsersCollection = Database.getDatabase().collection<User>("Users")
            // Find total users count
            UsersCollection.countDocuments({}).then(totalUsers => {
                // create new user
                UsersCollection.insertOne({
                    phoneNumber,
                    firstName: `User ${totalUsers + 1}`,
                    lastName: "",
                    avatarUrl: "",
                    bio: ""
                }).then(resolve).catch(console.log)
            }).catch(console.log)
        })
    }


    /**
     * Update the profile data of a particular user
     * @param userId id of user to be updated
     * @param firstName updated first name
     * @param lastName updated last name
     * @param bio updated bio
     * @param avatarUrl updated avatar url
     * @returns a promise
     */
    static async updateUserData(userId: string, firstName: string, lastName: string, bio: string, avatarUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const UsersCollection = Database.getDatabase().collection<User>("Users")
            UsersCollection.updateOne({
                _id: new ObjectId(userId)
            }, {
                $set: {
                    firstName: firstName,
                    lastName: lastName,
                    avatarUrl: avatarUrl,
                    bio: bio
                }
            }).then(result => {
                if (result.acknowledged) {
                    resolve()
                }
            }).catch(console.log)
        })
    }

    /**
     * Check if any user has a username
     * @param username username to be checked
     * @returns a promise containing a boolean value
     */
    static async usernameExists(username: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const UsersCollection = Database.getDatabase().collection<User>("Users")
            UsersCollection.findOne({ "user-name": username })
                .then(user => user ? resolve(true) : resolve(false))
                .catch(console.log)
        })
    }
}
