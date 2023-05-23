import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ChannelsService } from "services";


export default class ChannelsController {

    static async getMyContactsInChannel(req: Request, res: Response) {
        const userId = req["userId"]
        const channelId = req.params.channelId

        if (ObjectId.isValid(channelId)) {
            ChannelsService.fetchContactsInChannel(userId, channelId)
                .then(contactsInChannel => res.json({ contactsInChannel }))
        } else {
            res.status(400).json({ message: "invalid-channel-id" })
        }
    }

    static async getSubscribers(req: Request, res: Response) {
        const userId = req["userId"]
        const channelId = req.params.channelId
        let { query, offset } = req.query

        if (typeof query === "string" && typeof offset === "string") {
            let skip: number = 0

            if (/\d.*/.test(offset))
                skip = parseInt(offset)

            if (ObjectId.isValid(channelId)) {
                ChannelsService.fetchSubscribers(userId, channelId, query, skip)
                    .then(subscribers => res.json({ subscribers }))
            }
        }
    }
}