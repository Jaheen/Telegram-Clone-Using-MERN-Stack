import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { MessagesSevice } from "services";

/**
 * Class to handle events on Messages
 */
export default class MessagesController {
    static getMessages(req: Request, res: Response) {
        const userId = req["userId"]
        const { chatType, targetId } = req.params

        if (chatType && chatType.trim() !== "") {
            if (targetId && targetId.trim() !== "") {
                let beforeMessageId = req.query.before.toString()
                let afterMessageId = req.query.after.toString()

                if (!ObjectId.isValid(beforeMessageId))
                    beforeMessageId = null
                if (!ObjectId.isValid(afterMessageId))
                    afterMessageId = null
                    
                MessagesSevice.getMessages(userId, chatType, targetId, beforeMessageId, afterMessageId)
                    .then(messages => res.json({ messages }))

            } else
                res.status(400).json({ message: "target-id-not-provided" })
        } else
            res.status(400).json({ message: "chat-type-not-provided" })
    }
}