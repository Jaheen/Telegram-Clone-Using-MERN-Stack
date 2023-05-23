import { Request, Response } from "express";
import * as FirebaseAuth from "firebase-admin/auth"
import { AuthService } from "services";

/**
 * Class to handle auth requests
 */
export default class AuthController {

    /**
     * Handler for the login auth route
     * @param req request from client
     * @param res response to the client
     */
    static async login(req: Request, res: Response) {
        const { firebaseAuthToken } = req.body

        if (firebaseAuthToken && firebaseAuthToken.trim() !== "") {

            FirebaseAuth.getAuth().verifyIdToken(firebaseAuthToken)
                .then((decodedToken: FirebaseAuth.DecodedIdToken) => {

                    const phoneNumber = decodedToken.phone_number
                    AuthService.signInWithPhoneNumber(phoneNumber).then(serverAuthToken => {
                        res.json({ serverAuthToken })
                    })
                })
        }
    }

    /**
     * Verify the token provided by the client and respond whether it is valid or not
     * @param req request object from client
     * @param res response object to the client
     */
    static async verifyToken(req: Request, res: Response) {
        const { serverAuthToken } = req.body
        if (serverAuthToken && serverAuthToken.trim() !== "") {

            AuthService.verifyServerAuthToken(serverAuthToken)
                .then(_ => res.json({ isValid: true }))
                .catch(_ => res.json({ isValid: false }))
        }
    }
}