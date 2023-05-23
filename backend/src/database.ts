import { Db, MongoClient } from "mongodb";

/**
 * Class to contain the singleton instance of mongodb connection
 */
export default class Database {
    private static connection: MongoClient
    private static database: Db

    static async initDatabase() {
        return new Promise<void>((resolve, reject) => {
            this.connection = new MongoClient(process.env.MONGODB_CONNECTION_URI)
            this.connection.connect().then((conn: MongoClient) => {
                this.database = conn.db()
                resolve()
            }).catch(reject)
        })
    }

    /**
     * Get the singleton instance of the connected database
     * @returns singleton database instance
     */
    static getDatabase(): Db {
        if (this.database) {
            return this.database
        }
    }
}