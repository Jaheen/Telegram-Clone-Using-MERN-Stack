import { Request, Response } from "express";
import { UserService } from "services";

/**
 * Controller to handle requests regarding user profiles
 */
export default class ProfileController {

    static getUserProfile(req: Request, res: Response) {
        const { targetUserId } = req.params

        if (targetUserId && targetUserId.trim() !== "") {
            UserService.getUserProfile(targetUserId)
                .then(profile => res.json({ profile }))
                .catch(reason => res.status(404).json({ message: reason }))
        } else {
            res.status(400).json({ message: "user-id-not-provided" })
        }
    }

    static getMyProfile(req: Request, res: Response) {
        const userId = req["userId"]
        UserService.getUserProfile(userId)
            .then(profile => res.json({ profile }))
    }

    static updateProfile(req: Request, res: Response) {
        const userId = req["userId"]

        const { firstName, lastName, avatarUrl, bio, username } = req.body

        if (firstName && firstName.trim() !== "") {
            UserService.updateUserProfile(userId, firstName, lastName, bio, avatarUrl)
                .then(updatedUser => res.json({ updatedUser }))
        } else {
            res.status(400).json({ message: "first-name-not-provided" })
        }
    }

    static isUsernameAvailable(req: Request, res: Response) {
        const { username } = req.body

        if (username && username.trim() !== "") {
            UserService.checkUsernameAvailablity(username)
                .then(isAvailable => res.json({ isAvailable }))
        } else {
            res.status(400).json({ message: "username-not-provided" })
        }
    }
}