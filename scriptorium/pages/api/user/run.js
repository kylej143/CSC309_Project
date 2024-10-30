import { exec } from 'child_process';
import fs from "node:fs";

export default async function handler(req, res) {
    if (req.method === "GET") {

        let { shell_code, code, language } = req.body
        const file_name = Date.now().toString()

        let ext = null
        let executes = null
        switch (language) {
            case "python":
                ext = "py"
                executes = "py"
                break;
            case "javascript":
                ext = "js"
                executes = "node"
                break;
            case "java":
                ext = "java"
                break;
            case "c":
                ext = "c"
                break;
            case "c++":
                ext = "cpp"
                break;
        }

        try {
            await fs.writeFile(`run_folder/code${file_name}.${ext}`, code, (err) => {if (err) throw err;})
        }
        catch (e) {
            return res.status(500).json({ message: "Failed duplicating code" });
        }

        if (language === "python" || language === "javascript") {
            try {
                let cmd = executes + " " + `run_folder/code${file_name}.${ext}`;
                const result = await shell(cmd)
                let delete_cmd = "rm " + `run_folder/code${file_name}.${ext}`
                await shell(delete_cmd)
                return res.status(200).json(result)

            }
            catch (e) {
                return res.status(500).json({error: "something went wrong??"});
            }
        }

        if (language === "java") {

        }

        if (language === "c") {

        }

        if (language === "c++") {

        }

    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}

async function shell(cmd) {
    return new Promise(function (resolve) {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                resolve({ stderr });
            } else {
                resolve({ stdout });
            }
        });
    });
}
