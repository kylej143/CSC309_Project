import React from "react";
import Navigation from '../components/Navigation';
import Run from '../components/Run';


export default function Register() {

    return (
        <>
            <Navigation></Navigation>
            <div className="flex items-center bg-green-100 px-10 py-10 gap-5 text-green-700 text-2xl ">
                <div className="flex-1"/>
                <p>Code Code Code!</p>
                <div className="flex-1"/>
            </div>
            <Run></Run>
        </>
    );


}
