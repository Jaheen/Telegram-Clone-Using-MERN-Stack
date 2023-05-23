import { Users } from "models"

export default class UserService {

    static async getUserProfile(targetUserId: string) {
        return new Promise((resolve, reject) => {

            Users.findUserById(targetUserId).then(targetUser => {
                if (targetUser) {
                    targetUser["userId"] = targetUser._id.toString()
                    delete targetUser._id
                    const { firstName, lastName } = targetUser
                    targetUser["avatarText"] = firstName.substring(0, 1)
                    if (lastName)
                        targetUser["avatarText"] += lastName.substring(0, 1)
                    resolve(targetUser)
                } else {
                    reject("profile-not-found")
                }
            })
        })
    }

    static async updateUserProfile(userId: string, firstName: string, lastName: string, bio: string, avatarUrl: string) {
        return new Promise((resolve, reject) => {
            Users.updateUserData(userId, firstName, lastName, bio, avatarUrl).then(_ => {
                Users.findUserById(userId).then(user => {
                    if (user) {
                        user["userId"] = user._id
                        delete user._id
                        resolve(user)
                    } else {
                        reject("user-not-found")
                    }
                })
            })
        })
    }

    static checkUsernameAvailablity(username: string) {
        return Users.usernameExists(username)
    }
}