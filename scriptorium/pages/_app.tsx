import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {useEffect, useState} from "react";


export default function App({ Component, pageProps }: AppProps) {

    const [accessToken, setAccessToken] = useState("");
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        if (accessToken != "") localStorage.setItem("accessToken", accessToken);
        // get a new token every 500 seconds
        const myTimeout = setTimeout(getNewAToken, 10000);
    }, [accessToken, counter]);

    function getNewAToken() {
        if (localStorage.getItem("refreshToken") != null) {
            fetch("/api/user/refresh", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    refreshToken: localStorage.getItem("refreshToken"),
                }),
            }).then(r => r.json()).then(
                (res : {accessToken: String}) => {
                    if (res.accessToken == null) {
                        localStorage.setItem("accessToken", "")
                        localStorage.setItem("refreshToken", "")
                    }
                    setAccessToken(String(res.accessToken));
                    return
                })
        }
        else {
            setCounter(counter + 1)
        }
    }

    return (
        <>
            <Component {...pageProps} />
        </>
    );
}
