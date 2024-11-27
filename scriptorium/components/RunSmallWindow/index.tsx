import {useState, useEffect} from "react";
import { useRouter } from "next/router";
import React from "react";
// @ts-ignore
import SyntaxHighlighter from 'react-syntax-highlighter';
// @ts-ignore
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';


export default function RunSmallWindow() {
    const router = useRouter();
    const [code, setCode] = useState<string>("print(\"Hello Scriptorium!\")");
    const [language, setLanguage] = useState("python3");
    const [className, setClassName] = useState("");
    const [stdin, setStdin] = useState("");
    const [stdout, setStdout] = useState("");
    const [stderr, setStderr] = useState("");


    async function RunCode() {
        let response = await fetch("/api/user/run", {
            method: "POST",
            headers: {'Content-Type': 'application/json', },
            body: JSON.stringify({
                stdin: stdin,
                className: className,
                language: language,
                code: code,
            }),
        });
        let res = await response.json();
        setStdout(res.stdout);
        setStderr(res.stderr);
    }


    return (
        <>
            <div className="flex items-center px-10 py-3 gap-5 ">
                <input className="fixed p-3 bottom-1/2 left-24 right-1/2 h-8 bg-amber-500 placeholder-black"
                       placeholder="Write your stdin here!"
                       value={stdin} onChange={(e) => setStdin(e.target.value)}/>
                {Boolean(language === "java") ?
                    <input className="fixed p-3 bottom-1/2 left-1/4 right-1/2 h-8 bg-amber-300 placeholder-black"
                           placeholder="Class name you want to run must be Main"
                           value={className} onChange={(e) => setClassName(e.target.value)}/>: null}
                <button className="fixed text-center bottom-1/2 left-3/4 right-24 h-8 bg-amber-300 hover:bg-amber-900"
                        onClick={RunCode}>Run
                </button>
                <select className="fixed text-center bottom-1/2 left-1/2 right-1/4 h-8 bg-amber-400 hover:bg-green-400"
                        onChange={(e) => setLanguage(e.target.value)} value={language}>
                    <option value="javascript">javascript</option>
                    <option value="python2">python2</option>
                    <option value="python3">python 3</option>
                    <option value="java">java</option>
                    <option value="c">c</option>
                    <option value="cpp">c++</option>
                    <option value="haskell">haskell</option>
                    <option value="go">go</option>
                    <option value="swift">swift</option>
                    <option value="rust">rust</option>
                </select>

                <div className="fixed top-1/2 left-24 right-24 bottom-64 bg-amber-100"></div>
                <SyntaxHighlighter className="fixed top-1/2 left-24 right-24 bottom-64 " language={language}
                                   style={docco} customStyle={{
                    flex: '1',
                    background: 'transparent',
                }}>
                    {code}
                </SyntaxHighlighter>
                <textarea
                    className="fixed top-1/2 left-24 right-24 bottom-64 bg-transparent resize-none p-2 font-mono caret-black text-transparent outline-none"
                    value={code} onChange={(e) => setCode(e.target.value)}
                />

                <div
                    className="fixed p-3 top-3/4 left-24 right-24 bottom-10 bg-amber-100">{Boolean(stdout) ? stdout : stderr}</div>
            </div>

        </>
    );
}
