import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { GroupsSerivce } from "services";


export default class GroupsController {

    static async getMyContactsInGroup(req: Request, res: Response) {
        const userId = req["userId"]
        const groupId = req.params.groupId
        
        if (ObjectId.isValid(groupId)) {
            GroupsSerivce.fetchContactsInGroup(userId, groupId)
                .then(contactsInGroup => res.json({ contactsInGroup }))
        } else {
            res.status(400).json({ message: "invalid-group-id" })
        }
    }

    static async getMembers(req: Request, res: Response) {
        const userId = req["userId"]
        const groupId = req.params.groupId
        let { query, offset } = req.query

        if (typeof query === "string" && typeof offset === "string") {
            let skip: number = 0

            if (/\d.*/.test(offset))
                skip = parseInt(offset)

            if (ObjectId.isValid(groupId)) {
                GroupsSerivce.fetchMembers(userId, groupId, query, skip)
                    .then(members => res.json({ members }))
            }
        }
    }
}