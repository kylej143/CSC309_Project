import { useEffect, useState } from "react";
import React from "react";
import Navigation from "@/components/Navigation";

export default function sort(){
    const [b, sb] = useState([]);
    const [c, sc] = useState([]);
    const [b3, b33] = useState(false);
    const [c3, c33] = useState(false);
    const [b2, b22] = useState(1);
    const [c2, c22] = useState(1);
    
    const fb = async (val: number) => {b33(true);
        const t= localStorage.getItem("accessToken");
        const r = await fetch(`/api/admin/sort_blogs?page=${val}`,{headers:{ Authorization:`Bearer ${t}`}});
        const b = await r.json();
        if(r.ok){sb(b.blogs || []);}
        b33(false);
    };

    const fc = async (val: number) => {c33(true);
        const t = localStorage.getItem("accessToken");
        const r = await fetch(`/api/admin/sort_comments?page=${val}`,{headers:{ Authorization:`Bearer ${t}`}});
        const c = await r.json();
        if(r.ok){sc(c.comments || []);}
        c33(false);
    };

    useEffect(() => {fb(b2);},[b2]);
    useEffect(() => {fc(c2);},[c2]);

    return(<><Navigation/>
            <main className="p-3">
                <h1 className="flex justify-center font-bold">Blogs and comments here are sorted by the number fo reports.</h1>
                    <section className="mb-7">
                    <h2 className="flex justify-center">blogs</h2>
                    {b3?(<p></p>):(<ul className="space-x-1 space-y-5">
                            {b.map((blog:{id: number; title: string; flags: number}) => (<li key={blog.id} className="border p-1"><p className="text-white mb-4">title: {blog.title}</p><p>number of reports: {blog.flags}</p></li>
                            ))}</ul>)}
                    <div className="flex justify-center">
                        <button
                            onClick={() => b22((n) => Math.max(n-1,1))}
                            className="bg-red-300 text-black px-4 py-2">
                            previous
                        </button>
                        <button
                            onClick={() => b22((n) => n+1)}
                            className="bg-blue-300 text-black px-4 py-2">
                            next
                        </button>
                    </div>
                </section>
                <section>
                    <h2 className="flex justify-center">comments</h2>
                    {c3?(<p></p>):(<ul className="space-x-1 space-y-5">
                            {c.map((comment:{id: number; content: string; flags: number}) => (<li key={comment.id} className="border p-1"><p className="text-white mb-4">title: {comment.content}</p><p>number of reports: {comment.flags}</p></li>
                            ))} </ul>
                    )}
                    <div className="flex justify-center">
                        <button
                            onClick={() => c22((n) => Math.max(n-1,1))}
                            className="bg-red-300 text-black px-4 py-2">
                            previous
                        </button>
                        <button
                            onClick={() => c22((n) => n+1)}
                            className="bg-blue-300 text-black px-4 py-2">
                            next
                        </button>
                    </div>
                </section>
            </main>
        </>
    );
}
