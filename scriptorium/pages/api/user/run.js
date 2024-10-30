import { exec } from 'child_process';
import token_handler from "./protected";
import fs from "node:fs";

export default async function handler(req, res) {
    if (req.method === "GET") {

        let userV = await token_handler(req, res)

        if (!userV) {
            return res.status(403).json({error: "403 Forbidden"})
        }

        let { shell_code, code, language } = req.body

        try {
            const fs = require('node:fs');
            await fs.writeFile(`run_folder/code${userV.id}.txt`, code, (err) => {if (err) throw err;})
        }
        catch (e) {
            return res.status(500).json({ message: "Failed duplicating code" });
        }

        try {
            let cmd = language + " run_folder/code1.txt";
            const result = await shell(cmd)
            return res.status(200).json(result)
        }
        catch (e) {
            return res.status(500).json({error: "something went wrong??"});
        }

    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}

async function shell(cmd) {
    return new Promise(function (resolve, reject) {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                resolve({ stderr });
            } else {
                resolve({ stdout });
            }
        });
    });
}
