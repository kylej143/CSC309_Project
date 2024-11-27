import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import Navigation from '@/components/Navigation';
import { addTags, removeTags, getID, checkTagInArray } from '@/pages/blogs/index';

export default function Blogs() {

    // title and content
    const [titleCreate, setTitleCreate] = useState("");
    const [contentCreate, setContentCreate] = useState("");

    // tags
    const [originalTags, setOriginalTags] = useState<{ id: number, tag: string }[]>([]); // original tags
    const [tags, setTags] = useState<{ id: number, tag: string }[]>([]); // tags that are showing
    const [selectedTags, setSelectedTags] = useState<{ id: number, tag: string }[]>([]); // tags that are selected
    const [tagFilter, setTagFilter] = useState("");

    // adding new tag
    const [newTagField, setNewTagField] = useState("");
    const [newTagID, setNewTagID] = useState(-1);

    // code templates
    const [codeTemplates, setCodeTemplates] = useState<{ id: number, link: string }[]>([]);

    // adding new code template
    const [newCodeTemplateField, setNewCodeTemplateField] = useState("");
    const [newCodeTemplateID, setNewCodeTemplateID] = useState(-1);
    const [newTemplateError, setNewTemplateError] = useState("");

    const router = useRouter();

    // check if the user is logged in 
    function checkLoggedIn() {
        const loggedIn = localStorage.getItem("accessToken");
        if (!loggedIn) {
            router.push(`/login`);
        }
    }
    // create blog post
    const createBlog = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const loggedIn = localStorage.getItem("accessToken");

        // theoretically should not have to encounter login error, since checkLogggedIn is executed earlier
        if (loggedIn) {
            const stringTags: string[] = selectedTags.map((t) => t.tag);
            const numTemplates: number[] = codeTemplates.map((c) => c.id);
            const response = await fetch('/api/user/blogs',
                {
                    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` },
                    body: JSON.stringify({
                        title: titleCreate,
                        content: contentCreate,
                        tags: stringTags,
                        templates: numTemplates
                    }),
                }
            );

            if (response.ok) {
                alert("successfully saved");
                const data = await response.json();
                router.push(`/blogs/${data.id}`);
            }
            else {
                const data = await response.json();
                alert(data.error);
            }
        }
        else {
            alert("please log in");
        }

    };

    // get tags from api
    const fetchTags = async () => {
        const response = await fetch(`/api/user/blogs/tags`);
        const data = await response.json();
        setOriginalTags(data);
        setTags(data)
    }

    // filter through tags with search bar
    const filterTags = () => {
        const searchResponse = originalTags.filter((t) =>
        ((t.tag).toLowerCase().includes(tagFilter.toLowerCase())
            && !(checkTagInArray(selectedTags, t)))
        );
        setTags(selectedTags.concat(searchResponse));
    };

    // updating the tags that are checked or unchecked
    const updateSelectedTags = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tagID = Number((e.target.id).replace("tag", ""));

        if (e.target.checked) {
            const tagToModify = tags.filter((t) => t.id == tagID)[0];
            setSelectedTags(addTags(selectedTags, tagToModify));
        }
        else {
            setSelectedTags(removeTags(selectedTags, tagID));
        }
    }

    // add a new tag to the list of visible tags
    const addNewTag = (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.key === 'Enter') {
            e.preventDefault();
            const tagToAdd = {
                id: newTagID,
                tag: newTagField
            }
            setNewTagID(newTagID - 1);
            setNewTagField("");
            setTags(addTags(tags, tagToAdd));
        }
    }

    function addCodeTemplates(templateArray: { id: number, link: string }[], newTemplate: { id: number, link: string }) {
        return templateArray.concat([newTemplate]);
    }

    // add a new codetemplate to the blog
    const addNewCodeTemplate = (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.key === 'Enter') {
            e.preventDefault();
            const trimCodeTemplates = /.*code_templates\//
            const templateNum = Number(newCodeTemplateField.replace(trimCodeTemplates, ""));
            if (isNaN(templateNum)) {
                setNewTemplateError("Invalid link format");
                setNewCodeTemplateField("");
            }
            else {
                setNewCodeTemplateID(newCodeTemplateID - 1);
                const templateToAdd = {
                    id: templateNum,
                    link: newCodeTemplateField,
                }
                setCodeTemplates(addCodeTemplates(codeTemplates, templateToAdd));
                setNewCodeTemplateField("");
                setNewTemplateError("");
            }

        }
    }

    useEffect(() => {
        checkLoggedIn();
        fetchTags();
    }, []);

    useEffect(() => {
        filterTags();
    }, [tagFilter]);

    return (
        <div>
            <Navigation></Navigation>
            <div className="p-4">
                <h1 className="blogSearchTitle">Create Blog</h1>

                {/* create blog post */}
                <div>
                    <form onSubmit={createBlog}>
                        <div>
                            <label htmlFor="blogTitleCreate">Title:</label>
                            <br></br>
                            <input type="text"
                                id="blogTitleCreate"
                                className="blogSearch w-full"
                                value={titleCreate}
                                onChange={(e) => (setTitleCreate(e.target.value))} />
                        </div>
                        <div>
                            <label htmlFor="blogContentCreate">Content:</label>
                            <br></br>
                            <textarea
                                id="blogContentCreate"
                                className="blogSearch w-full"
                                value={contentCreate}
                                onChange={(e) => (setContentCreate(e.target.value))} />
                        </div>

                        <div>Tags:</div>
                        <div className="border-2 p-4 bg-gray-100">

                            <input type="text"
                                id="tagFilter"
                                className="blogSearch mb-2"
                                value={tagFilter}
                                placeholder="Find tags"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={(e) => (setTagFilter(e.target.value))} />
                            <div className="flex flex-row gap-2 flex-wrap">
                                {tags.map((t) => (
                                    <div key={t.id} className="tagItem flex flex-row gap-2">
                                        <input type="checkbox" id={getID(t.id)}
                                            onChange={updateSelectedTags} />
                                        <label htmlFor={getID(t.id)}>{t.tag}</label> <br></br>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-row gap-2 mt-2">
                                <div id="newTagItem" className="tagItem">
                                    <input type="text" placeholder="new tag (enter to submit)"
                                        value={newTagField}
                                        onKeyDown={addNewTag}
                                        onChange={(e) => (setNewTagField(e.target.value))}>
                                    </input>
                                </div>

                            </div>
                        </div>

                        <div>Code Templates</div>
                        <div className="border-2 p-4 bg-gray-100 ">
                            <div className=" gap-2 flex-wrap">
                                {codeTemplates.map((c) => (
                                    <div key={`template${c}`} className="tagItem flex flex-row gap-2">
                                        <div>{c.link}</div>
                                    </div>
                                ))}
                            </div>
                            <input type="text"
                                id="newCodeTemplateItem"
                                className="blogSearch mb-2 w-full"
                                value={newCodeTemplateField}
                                placeholder="Add a code template by link"
                                onKeyDown={addNewCodeTemplate}
                                onChange={(e) => (setNewCodeTemplateField(e.target.value))}>
                            </input>
                            <div className="text-red-600">{newTemplateError}</div>
                        </div>
                        <button className="bg-pink-300 mt-2" type="submit" >Create Blog</button>
                    </form>
                </div>

            </div>
        </div>

    )
}