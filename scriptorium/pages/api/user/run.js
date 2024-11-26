import { exec } from 'child_process';
import fs from "node:fs";
import {json} from "node:stream/consumers";

export default async function handler(req, res) {
    if (req.method === "POST") {

        let { stdin, code, language, className } = req.body
        const file_name = Date.now().toString(36) + Math.random().toString(36).substr(2)

        let ext = null
        switch (language) {
            case "python3":
                ext = "main.py"
                break;
            case "python2":
                ext = "main.py"
                break;
            case "javascript":
                ext = "index.js"
                break;
            case "java":
                ext = "main.java"
                break;
            case "c":
                ext = "main.c"
                break;
            case "cpp":
                ext = "main.cpp"
                break;
            case "rust":
                ext = "main.rs"
                break;
            case "swift":
                ext = "main.swift"
                break;
            case "go":
                ext = "main.go"
                break;
            case "haskell":
                ext = "main.hs"
                break;
        }

        try {
            // make a working instance for the run
            let cmd = "cd run_folder \n" + `cp -r ./docker_folder ./${file_name}`;
            await shell(cmd)
            // copy the code into the correct language folder
            await fs.writeFile(`run_folder/${file_name}/${language}/${ext}`, code, (err) => {if (err) throw err;})

            if (stdin !== null) {
                const std_str = stdin.split(" ")
                let d_file_str = ""
                for (let i = 0; i < std_str.length; i++) {
                    d_file_str += ", \"" + std_str[i] + "\""
                }
                d_file_str += "]"
                await fs.appendFile(`run_folder/${file_name}/${language}/Run`, d_file_str, (err) => {if (err) throw err;})
            }
            else {
                await fs.appendFile(`run_folder/${file_name}/${language}/${ext}`, "]", (err) => {if (err) throw err;})
            }
        }
        catch (e) {
            return res.status(500).json({ error: "Failed duplicating code" });
        }

        if (language === "java" || language === "c" || language === "cpp" || language === "rust" || language === "swift"|| language === "haskell") {
            try {
                let cmd = `cd run_folder/${file_name}/${language} \n docker build -t ${file_name} .`;
                await shell_no_timeout(cmd)  // no timeout as it may take more than 4 seconds for docker to finish
                cmd = `cd run_folder/${file_name}/${language} \n docker run ${file_name}`;
                let result = await shell(cmd)
                if (!result.stderr) {
                    let cmd = `cd run_folder/${file_name}/${language} \n docker build -f Run -t a${file_name} .`;
                    await shell_no_timeout(cmd)  // no timeout as it may take more than 4 seconds for docker to finish
                    cmd = `cd run_folder/${file_name}/${language} \n docker run a${file_name}`;
                    let resultr = await shell(cmd)
                    let delete_cmd = "rm -rf " + `run_folder/${file_name}`
                    await shell(delete_cmd)
                    return res.status(200).json(resultr)
                }
                else {
                    // delete after use
                    let delete_cmd = "rm -rf " + `run_folder/${file_name}`
                    await shell(delete_cmd)
                    return res.status(200).json(result)
                }
            }
            catch (e) {
                return res.status(500).json({error: "blame kyle for bad coding (server side error)"});
            }
        }
        else {
            try {
                let cmd = `cd run_folder/${file_name}/${language} \n docker build -t ${file_name} .`;
                await shell_no_timeout(cmd)  // no timeout as it may take more than 4 seconds for docker to finish
                cmd = `cd run_folder/${file_name}/${language} \n docker run ${file_name}`;
                const result = await shell(cmd)
                // delete after use
                let delete_cmd = "rm -rf " + `run_folder/${file_name}`
                await shell(delete_cmd)
                return res.status(200).json(result)

            }
            catch (e) {
                return res.status(500).json({error: "blame kyle for bad coding (server side error)"});
            }
        }

    } else {
        return res.status(405).json({ error: "Method not allowed" });
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

async function shell_no_timeout(cmd) {
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