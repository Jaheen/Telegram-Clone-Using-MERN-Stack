import { Request, Response } from "express";
import { ChatsService } from "services";

/**
 * Controller to respond to requests on 
 */
export default class ChatsController {

    /**
     * Handler to get chats of user and return
     * @param req request object
     * @param res response object
     */
    static getMyChats(req: Request, res: Response) {
        const userId = req["userId"]
        ChatsService.getChatsOfUser(userId)
            .then(chats => res.json({ chats }))
    }

    static getChatData(req: Request, res: Response) {
        const userId = req["userId"]
        const { chatType, targetId } = req.params

        if (chatType && chatType.trim() !== "") {
            if (targetId && targetId.trim() !== "") {

                ChatsService.getChat(userId, chatType, targetId)
                    .then(chatData => res.json({ chatData }))
                    .catch(reason => {
                        switch (reason) {
                            case "user-not-found":
                            case "group-not-found":
                            case "channel-not-found":
                                res.status(404).json({ message: reason })
                                break;
                            case "wrong-chat-type":
                                res.status(400).json({ message: reason })
                                break;
                            default:
                                console.log(reason)
                                break;
                        }
                    })
            } else
                res.status(400).json({ message: "target-id-not-provided" })
        } else
            res.status(400).json({ message: "chat-type-not-provided" })
    }
}