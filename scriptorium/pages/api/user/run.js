import { exec } from 'child_process';
import fs from "node:fs";

export default async function handler(req, res) {
    if (req.method === "GET") {

        let { stdin, code, language, className } = req.body
        const file_name = Date.now().toString(36) + Math.random().toString(36).substr(2)

        let ext = null
        let executes = null
        let compiler = null
        let exe_ext = null
        switch (language) {
            case "python":
                ext = "py"
                executes = "python3"
                break;
            case "javascript":
                ext = "js"
                executes = "node"
                break;
            case "java":
                ext = "java"
                executes = "java"
                compiler = "javac"
                exe_ext = "class"
                break;
            case "c":
                ext = "c"
                compiler = "gcc"
                break;
            case "c++":
                ext = "cpp"
                compiler = "g++"
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
                return res.status(500).json({error: "blame kyle for bad coding (server side error)"});
            }
        }

        if (language === "java") {
            try {
                let cmd = "mkdir " + `run_folder/${file_name}`;
                await shell(cmd)
                // compile
                cmd = compiler + " " + `run_folder/code${file_name}.${ext}` + " -d " + `run_folder/${file_name}`;
                let result = await shell(cmd)
                if (result.stdout !== "") {
                    let delete_cmd = "rm " + `run_folder/code${file_name}.${ext}`
                    await shell(delete_cmd)
                    return res.status(200).json(result)
                }
                // execute
                cmd = `cd run_folder/${file_name}\n`+ executes + " " + className +  ` ${stdin}`;
                result = await shell(cmd)

                // delete used files
                let delete_cmd = "rm " + `run_folder/code${file_name}.${ext}`
                await shell(delete_cmd)
                delete_cmd = "rm -rf " + `run_folder/${file_name}`
                await shell(delete_cmd)
                return res.status(200).json(result)
            }
            catch (e) {
                return res.status(500).json({error: "blame kyle for bad coding (server side error)"});
            }
        }

        if (language === "c" || language === "c++") {
            try {
                // compile
                let cmd = "cd run_folder\n" + compiler + " " + `code${file_name}.${ext}` + " -o " + `${file_name}`;
                let result = await shell(cmd)
                if (result.stdout !== "") {
                    let delete_cmd = "rm " + `run_folder/code${file_name}.${ext}`
                    await shell(delete_cmd)
                    return res.status(200).json(result)
                }
                // execute
                cmd = "cd run_folder\n" + `./${file_name} ${stdin}`;
                result = await shell(cmd)

                // delete used files
                let delete_cmd = "rm " + `run_folder/code${file_name}.${ext}`
                await shell(delete_cmd)
                delete_cmd = "rm " + `run_folder/${file_name}`
                await shell(delete_cmd)
                return res.status(200).json(result)
            }
            catch (e) {
                return res.status(500).json({error: "blame kyle for bad coding (server side error)"});
            }
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
        setTimeout(() => resolve({stderr: "timed out (max 4 seconds)"}), 4000);
    });
}
