import React, {useEffect} from "react";
import { useState } from 'react';
import { useRouter } from "next/router"; 
import Navigation from "../components/Navigation";
// got basic style and logic help by gpt
interface codetemplate{
    id: number;
    title: string;
    explanation: string;
    code: string;
    tags: {tag: string}[];
}
  
export default function codetemplates(){
    const router = useRouter();
    const [ct, setct] = useState<codetemplate[]>([]);
    const [title, sett] = useState<string>("");
    const [explanation, sete] = useState<string>("");
    const [tags, setta] = useState<string>("");
    const [page, setp] = useState<number>(1);
    const [c, setc] = useState<boolean>(false);
    const [nt, setn] = useState({title: "", explanation: "", code: "", tags: ""});
    const [ee, setee] = useState<boolean>(false);
    const [st, setst] = useState<codetemplate | null>(null);
    const [fff, setf] = useState<boolean>(false);
    const [ft, setft] = useState<codetemplate | null>(null);
    
    const getct = async () => {
        try{
            const p = new URLSearchParams();
            if(title){
                p.append("title", title);
            }
            if(explanation){
                p.append("explanation", explanation);
            }
            if(tags){
                p.append("tags", tags);
            }
            if(page){
                p.append("page", page.toString());
            }
                const r = await fetch(`/api/user/code_templates?${p.toString()}`, {method: "GET"});
                const d = await r.json();
            if(r.ok){
                setct(d);
            }else{
                console.error("error");
            }
        }catch{
            console.error("error");
        }
    };
  
    useEffect(() => {getct();}, [page]);
  
    const searchct = (val: React.FormEvent) => {val.preventDefault(); setp(1); getct();};
  
    const pn = () => {setp((n) => n + 1);};
    const pp = () => {setp((n) => Math.max(n - 1, 1));};
  
    const create = async (val: React.FormEvent) => {val.preventDefault();
        const tk = localStorage.getItem("accessToken");
        if(tk){
            try{
            const r = await fetch("/api/user/code_templates", {method: "POST", headers: {"Content-Type": "application/json", Authorization: `Bearer ${tk}`},
                body: JSON.stringify({
                title: nt.title,
                explanation: nt.explanation,
                code: nt.code,
                tags: nt.tags.split(",").map((n) => n.trim()),
                }),
            });
            if(r.ok){
                alert("You successfully saved the code template");
                setn({title: "", explanation: "", code: "", tags: "" });
                setc(false);
                getct();
            }else{
                alert("error");
            }
            }catch{
                alert("error");
                console.error("error");
            }
        }else{
            alert("You have to log in to save the code template");
            return;
        }
    };
  
    const edit = (template: codetemplate) => {setst(template); setee(true);};
  
    const update = async (val: React.FormEvent) => {val.preventDefault();
        if(!st){
            return;
        }else{
            const tk = localStorage.getItem("accessToken");
            if(tk){
                try{
                    const r = await fetch(`/api/user/code_templates?id=${st.id}`, {method: "PUT", headers: {"Content-Type": "application/json", Authorization: `Bearer ${tk}`},
                    body: JSON.stringify({
                        title: st.title,
                        explanation: st.explanation,
                        code: st.code,
                        tags: st.tags.map((n) => n.tag),
                    }),
                    });
                
                    if(r.ok){
                        alert("You successfully edited the code template");
                        setee(false);
                        setst(null);
                        getct(); 
                    }else{
                        alert("You can only edit your own code templates");
                    }
                }catch{
                    alert("error");
                    console.error("error");
                }
            }else{
                alert("You have to log in to edit the code template");
                return;
            }
        } 
    };
    
    const del = async (templateId: number) => {
        const tk = localStorage.getItem("accessToken");
    
        if(tk){
            try{
                const r = await fetch(`/api/user/code_templates?id=${templateId}`, {method: "DELETE", headers: {Authorization: `Bearer ${tk}`}});
                if(r.ok){
                    alert("You successfully deleted the code template");
                    getct();
                }else{
                    alert("You can only delete your own code templates");
                }
            }catch{
                alert("error");
            }
        }else{
            alert("You have to log in to delete the code template");
            return;
        }    
    };
  
    const fork = (template: codetemplate) => {setft({...template}); setf(true);};
  
    const fork2 = async (val: React.FormEvent) => {val.preventDefault();
        if(!ft){
            return;
        }else{
            const tk = localStorage.getItem("accessToken");
            try{
                const r = await fetch(`/api/user/code_templates?fork=true&id=${ft.id}`,{method: "POST", headers: {"Content-Type": "application/json", ...(tk && { Authorization: `Bearer ${tk}` })},
                    body: JSON.stringify({
                    title: ft.title,
                    explanation: ft.explanation,
                    code: ft.code,
                    tags: ft.tags.map((n) => n.tag),
                    }),
                });
            
                if (r.ok) {
                    if(tk){
                        alert("You successfully forked the code template");
                        setf(false);
                        setft(null);
                        getct();
                    }else{
                        alert("You have to log in to fork the code template");
                        setf(false);
                        setft(null);
                    }
                } else {
                    alert("error");
                }
            }catch{
                alert("error");           
            }
        }
    };
  
    const run = (template: codetemplate) => {
        router.push({
            pathname: "/run",
            query: {
            code: template.code,
            language: "javascript",
            title: template.title,
            explanation: template.explanation,
            },
        });
        setf(false);
    };
  
    return(
    <>
    <Navigation />
        <main>
            <div className="flex items-center bg-green-100 px-10 py-5 gap-5 text-green-700 text-2xl">
                <div className="flex-1" />
                <p>Code Templates</p>
                <div className="flex-1" />
                </div>
  
                <div className="flex justify-center bg-green-100">
                    <form onSubmit={searchct} className="w-full max-w-lg">
                    <div className="mb-4">
                        <input
                        type="text"
                        value={title}
                        onChange={(e) => sett(e.target.value)}
                        className="shadow appearance-none border w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="title"/>
                    </div>
                <div className="mb-4">
                    <input
                    type="text"
                    value={tags}
                    onChange={(val) => setta(val.target.value)}
                    className="shadow appearance-none border w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="tags (must be separated by commas)"/>
                </div>
                <div className="mb-4">
                    <input
                    type="text"
                    value={explanation}
                    onChange={(val) => sete(val.target.value)}
                    className="shadow appearance-none border w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="explanation"/>
                </div>
                <div className="flex justify-end">
                    <button
                    type="submit"
                    className="bg-red-500 text-black py-2 px-4 focus:outline-none focus:shadow-outline">
                    search
                    </button>
                </div>
                </form>
            </div>
  
            <div className="flex justify-end bg-green-100 px-12">
                <button
                className="bg-red-500 text-black px-4 py-2"
                onClick={() => setc(true)}>
                create a code template
                </button>
            </div>
  
            <div className="bg-green-100 px-10 py-5">
                {ct.length === 0 ? (<p className="text-center text-black">There is no code template based on your search</p>):
                (ct.map((g) => (
                    <div key={g.id} className="bg-blue-400  border p-4 mb-3">
                    <h2 className="flex justify-center text-xl text-black font-bold">{g.title}</h2>
                    <p className="flex justify-center text-black mt-1">{g.explanation}</p>
                    <pre className="flex justify-center bg-white text-black p-2 mt-1">{g.code}</pre>
                    <div className="flex justify-center text-black mt-2">
                        {g.tags.map((n, index) => (<span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 mr-2"> {n.tag} </span>))}
                    </div>
                    <div className="flex justify-center items-center mt-4">
                        <button
                        className="bg-purple-600 text-yellow px-4 py-2 mr-1"
                        onClick={() => edit(g)}>
                        Edit
                        </button>
                        <button
                        className="bg-orange-600 text-yellow px-4 py-2 mr-1"
                        onClick={() => del(g.id)}>
                        Delete
                        </button>
                        <button
                        className="bg-pink-600 text-yellow px-4 py-2 mr-1"
                        onClick={() => fork(g)}>
                        Fork
                        </button>
                        <button
                        className="bg-green-600 text-yellow px-4 py-2"
                        onClick={() => run(g)}>
                        Run
                    </button>
                    </div>
                    </div>
                ))
                )}
            </div>
  
            <div className="flex justify-center bg-green-100">
                <button
                className="bg-red-300 text-black px-4 py-2"
                onClick={pp}>
                previous
                </button>
                <span className="px-4 py-2 bg-yellow text-black ">
                {page}
                </span>
                <button
                className="bg-red-300 text-black px-4 py-2"
                onClick={pn}>
                Next
                </button>
            </div>
  
            {c && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                <div className="bg-green p-4 w-full max-w-lg">
                    <h2 className="text-xl font-bold mb-4">create a code template</h2>
                    <form onSubmit={create}>
                    <div className="text-black mb-4">
                        <input
                        type="text"
                        value={nt.title}
                        onChange={(val) => setn({ ...nt, title: val.target.value })}
                        placeholder="title"
                        className="border w-full mb-2 p-2"
                        required/>
                    </div>
                    <div className="text-black mb-4">
                        <textarea
                        value={nt.explanation}
                        onChange={(val) => setn({ ...nt, explanation: val.target.value })
                        }
                        placeholder="explanation"
                        className="border w-full mb-2 p-2"
                        required/>
                    </div>
                    <div className="text-black mb-4">
                        <textarea
                        value={nt.code}
                        onChange={(val) => setn({ ...nt, code: val.target.value })}
                        placeholder="code"
                        className="border w-full mb-2 p-2"
                        required/>
                    </div>
                    <div className="text-black mb-4">
                        <input
                        type="text"
                        value={nt.tags}
                        onChange={(e) =>
                            setn({ ...nt, tags: e.target.value })
                        }
                        placeholder="tags (separated by commas)"
                        className="border w-full mb-2 p-2"
                        required/>
                    </div>
                    <div className="flex justify-end">
                        <button
                        type="button"
                        onClick={() => setc(false)}
                        className="bg-pink text-white px-4 py-2 mr-1">
                        cancel
                        </button>
                        <button
                        type="submit"
                        className="bg-pink text-white px-4 py-2">
                        save the code template
                        </button>
                    </div>
                    </form>
                </div>
                </div>
            )}
  
            {ee && st && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                <div className="bg-green p-4 w-full max-w-lg">
                    <h2 className="text-xl font-bold mb-4">edit the code template</h2>
                    <form onSubmit={update}>
                    <div className="text-black mb-4">
                        <input
                        type="text"
                        value={st.title}
                        onChange={(val) => setst({ ...st, title: val.target.value })}
                        placeholder="title"
                        className="border w-full mb-2 p-2"/>
                    </div>
                    <div className="text-black mb-4">
                        <textarea
                        value={st.explanation}
                        onChange={(val) => setst({ ...st, explanation: val.target.value })}
                        placeholder="explanation"
                        className="border w-full mb-2 p-2"/>
                    </div>
                    <div className="text-black mb-4">
                        <textarea
                        value={st.code}
                        onChange={(val) => setst({ ...st, code: val.target.value })}      
                        placeholder="code"
                        className="border w-full mb-2 p-2"/>
                    </div>
                    <div className="text-black mb-4">
                        <input
                        type="text"
                        value={st.tags.map((n) => n.tag).join(", ")}
                        onChange={(val) => setst({...st, tags: val.target.value.split(",").map((a) => ({ tag: a.trim() }))})}
                        placeholder="tags (separated by commas)"
                        className="border w-full mb-2 p-2"/>
                    </div>
                    <div className="flex justify-end">
                        <button
                        type="button"
                        onClick={() => {
                            setee(false);
                            setst(null);
                        }}
                        className="bg-pink text-white px-4 py-2 mr-1">
                        cancel
                        </button>
                        <button
                        type="submit"
                        className="bg-pink text-white px-4 py-2">
                        edit the code template
                        </button>
                    </div>
                    </form>
                </div>
                </div>
                )}
  
                {fff && ft && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                    <div className="bg-green p-6 w-full max-w-lg">
                    <h2 className="text-xl font-bold mb-4">fork the code template</h2>
                    <form onSubmit={fork2}>
                        <div className="text-black mb-4">
                        <input
                            type="text"
                            value={ft.title}
                            onChange={(val) => setft({ ...ft, title: val.target.value })}
                            placeholder="title"
                            className="border w-full mb-2 p-2"/>
                        </div>
                        <div className="text-black mb-4">
                        <textarea
                            value={ft.explanation}
                            onChange={(val) => setft({ ...ft, explanation: val.target.value })}
                            placeholder="explanation"
                            className="border w-full mb-2 p-2"/>
                        </div>
                        <div className="text-black mb-4">
                        <textarea
                            value={ft.code}
                            onChange={(val) => setft({ ...ft, code: val.target.value })}
                            placeholder="code"
                            className="border w-full mb-2 p-2"/>
                        </div>
                        <div className="text-black mb-4">
                        <input
                            type="text"
                            value={ft.tags.map((n) => n.tag).join(", ")}
                            onChange={(val) => setft({...ft, tags: val.target.value.split(",").map((b) => ({ tag: b.trim() }))})}
                            placeholder="tags (separated by commas)"
                            className="border w-full mb-2 p-2"
                            required
                        />
                        </div>
                        <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => {setf(false); setft(null);}}
                            className="bg-pink text-white px-4 py-2 mr-1">
                            cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-pink text-white px-4 py-2">
                            fork the template
                        </button>
                        <button
                            type="button"
                            onClick={() => run(ft)}
                            className="bg-pink text-white px-4 py-2">
                            run
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
                )}
            </main>
        </>
    );
}
