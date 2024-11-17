import React, {useEffect} from "react";
import { useState } from 'react';
import Navigation from '../components/Navigation';


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
                  <p>accessToken: {accessToken}</p>
                  <div className="flex-1"/>
              </div>
              <div className="flex items-center bg-green-100 px-10 gap-5 ">
                  <div className="flex-1"/>
                  <p>refreshToken: {refreshToken}</p>
                  <div className="flex-1"/>
              </div>
          </main>

      </>
    );


}
