import { Server as HTTPServer, createServer } from "http"
import * as express from "express"
import * as dotenv from "dotenv"
import Database from "database"
import initSocketIO from "socket"
import { initializeApp } from "firebase-admin/app"
import * as cors from "cors"
import { credential } from "firebase-admin"
import { APIRouter, AuthRouter } from "routers"

/**
 * Server class that controls actions of server
 */
class TelegramCloneServer {

    /**
     * PORT number on which the server must listen for connections
     */
    private PORT: Number

    /**
     * express application instance
     */
    private application: express.Application

    /**
     * https server instance
     */
    private httpServer: HTTPServer

    /**
     * Constructor for the server
     * @param {Number} PORT port number for the server to listen
     */
    constructor(PORT: Number) {
        this.PORT = PORT
        this.application = express()
        this.httpServer = createServer(this.application)
    }

    /**
     * Initialize and start the server and wait for clients
     */
    async start() {

        // initialize firebase application
        initializeApp({
            credential: credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            })
        })

        // initialize data connection and database
        await Database.initDatabase()
            .then(() => console.log("Connected to database successfully"))
            .catch(console.log)

        // initalize socket io
        initSocketIO(this.httpServer)

        this.application.use(cors())

        this.application.use("/auth", AuthRouter)
        this.application.use("/api", APIRouter)

        // start server to listen
        this.httpServer.listen(this.PORT, () => {
            console.log(`Server started on PORT: ${this.PORT}`)
        })
    }
}

/**
 * Immediately invokable function as entry point main function
 */
(() => {

    // initialize config (dev mode only)
    dotenv.config()

    const server = new TelegramCloneServer(parseInt(process.env.PORT) || 8080)
    server.start()
})()