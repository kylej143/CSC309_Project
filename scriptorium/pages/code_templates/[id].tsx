import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import Navigation from '@/components/Navigation';

interface codetemplate {
    id: number;
    title: string;
    explanation: string;
    code: string;
    tags: { tag: string }[];
    blogs: { id: number, title: string, userID: number }[];
}

interface codetemplatepagep {
    template: codetemplate;
}

const codetemplatepagee: React.FC<codetemplatepagep> = ({ template }) => {
    const r = useRouter();
    const run = () => {
        r.push({
            pathname: "/run", query: { code: template.code, language: "javascript", title: template.title, explanation: template.explanation }
        });
    };

    return (
        <div>
            <Navigation></Navigation>
            <main className="bg-green-100 px-10 py-5">

                <h1 className="flex justify-center text-xl text-black font-bold">{template.title}</h1>
                <p className="flex justify-center text-black mt-1">{template.explanation}</p>
                <pre className="flex justify-center bg-white text-black p-2 mt-1">{template.code}</pre>
                <div className="flex justify-center text-black mt-2">
                    {template.tags.map((n, index) => (<span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 mr-2"> {n.tag} </span>))}
                </div>
                <div className="flex justify-center items-center mt-4">
                    <button
                        className="bg-green-600 text-yellow px-4 py-2"
                        onClick={run}>
                        run
                    </button>
                </div>
                <div className="text-center mt-6">Linked Blogs</div>
                <div className="flex flex-row flex-wrap gap-2 mt-2">
                    {template.blogs.map((gb) => (
                        <div key={gb.id} className="bg-slate-300 px-4 py-2"
                            onClick={() => r.push(`/blogs/${gb.id}`)}
                        >{`${gb.id}: ${gb.title}`}</div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params!;
    const r = await fetch(`http://localhost:3000/api/user/code_templates/${id}`);

    if (!r.ok) {
        return { notFound: true };
    }
    const template = await r.json();
    return {
        props: { template }
    };
};

export default codetemplatepagee;
