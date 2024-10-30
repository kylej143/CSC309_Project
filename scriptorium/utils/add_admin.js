import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// this is a top-level await
export default (async () => {
    try {
        // open the database
        const db = await open({
            filename: './prisma/dev.db',
            driver: sqlite3.Database
        })
        await db.exec('INSERT INTO user VALUES (null, "admin1", "$2b$10$O.KUKiZjxIB5jOV3Cs4hMefFSyqHJJrW5s9a6wvRswG4xUwgl8P0a", "admin", "admin@mail.com", 2, 11111111111, "ADMIN")')

    }
    catch (error) {
        console.log("admin already exists", error)
    }
    })()