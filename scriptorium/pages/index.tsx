import React, {useEffect} from "react";
import { useState } from 'react';
import Navigation from '../components/Navigation';
import Link from "next/link";
import RunSmallWindow from "@/components/RunSmallWindow";


export default function Login() {

    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");

    useEffect(() => {
    setAccessToken(String(localStorage.getItem("accessToken")));
    setRefreshToken(String(localStorage.getItem("refreshToken")));
    }, []);

    return (
      <>
          <Navigation></Navigation>
          <main>
              <div className="flex items-center bg-green-100 px-10 py-10 gap-5 text-green-700 text-2xl ">
                  <div className="flex-1"/>
                  <p>WELCOME TO THE LANDING PAGE</p>
                  <div className="flex-1"/>
              </div>
              <div className="flex items-center bg-green-100 px-10 gap-5 ">
                  <div className="flex-1"/>
                  <p>Visit our github page: <a className="text-sky-500 hover:text-sky-800"
                                               href="https://github.com/kylej143/CSC309_Project">https://github.com/kylej143/CSC309_Project</a>
                  </p>
                  <div className="flex-1"/>
              </div>
              <div className="flex items-center bg-green-100 h-16"/>
              <div className="flex items-center bg-green-100 px-10 gap-5 ">
                  <div className="flex-1"/>
                  <Link
                      className="p-10 w-60 text-2xl  text-middle text-center border-2 bg-green-400 border-green-700 hover:bg-amber-500"
                      href="/run">Start Coding!</Link>
                  <div className="flex-1"/>
              </div>
              <div className="flex items-center bg-green-100 h-16"/>
              <RunSmallWindow></RunSmallWindow>

          </main>

      </>
    );


}
