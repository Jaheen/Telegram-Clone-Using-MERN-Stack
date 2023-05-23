import { NextFunction, Request, Response } from "express";
import { AuthService } from "services";

/**
 * If auth header is valid allow access block otherwise
 * 
 * @param req Request object
 * @param res Response object
 * @param next next function to call next middleware or handler
 */
export default function APIAuthMiddleware(req: Request, res: Response, next: NextFunction) {

    // fetch authorization header ie "Bearer jwttoken"
    const authHeader = req.headers.authorization

    if (!authHeader)
        res.status(401).json({ error: "jwt-not-provided" })

    // fetch the jwt by splitting it
    const splitArr = authHeader.split(" ")

    if (splitArr.length !== 2)
        res.status(401).json({ error: "jwt-not-provided" })

    const serverAuthToken = splitArr[1]


    if (serverAuthToken && serverAuthToken.trim() !== "") {
        // using auth service verify the token
        // if valid allow
        // else send unauthorized
        AuthService.verifyServerAuthToken(serverAuthToken)
            .then((userId: string) => {
                req["userId"] = userId
                next()
            }).catch(_ => res.status(401).json({ error: "jwt-invalid" }))
    }
}