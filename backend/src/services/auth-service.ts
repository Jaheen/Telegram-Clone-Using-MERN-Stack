import { sign, verify } from "jsonwebtoken"
import { Users } from "models"

/**
 * Service to perform operation regarding Authentication
 */
export default class AuthService {

    /**
     * Authenticate using phone number and generate jwt token
     * @param phoneNumber phone number of expected user
     * @returns promise with jwt token or error
     */
    static async signInWithPhoneNumber(phoneNumber: string): Promise<string> {

        return new Promise((resolve, reject) => {
            Users.findUserByPhoneNumber(phoneNumber).then(user => {
                if (user) {
                    const serverAuthToken = sign(user._id.toString(), process.env.JWT_SECRET_KEY)
                    resolve(serverAuthToken)
                } else {
                    Users.createUserWithPhoneNumber(phoneNumber).then(result => {
                        if (result.acknowledged) {
                            const serverAuthToken = sign(result.insertedId.toString(), process.env.JWT_SECRET_KEY)
                            resolve(serverAuthToken)
                        }
                    })
                }
            })
        })
    }

    /**
     * Verify a token whether it is valid or not
     * @param serverAuthToken token to be verified
     * @returns promise with true or false regarding valid or not
     */
    static async verifyServerAuthToken(serverAuthToken: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // first verify if token is valid jwt
            verify(serverAuthToken, process.env.JWT_SECRET_KEY, (err, userId: string) => {
                if (err) reject("malformed-token")
                else {
                    // if valid decode userid from token and find user in database
                    Users.findUserById(userId).then(user => {
                        // if found resolve true
                        if (user) resolve(user._id.toString())
                        // else resolve false
                        else reject("user-not-found")
                    })
                }
            })
        })
    }
}