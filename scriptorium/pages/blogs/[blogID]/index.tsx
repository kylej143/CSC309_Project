import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import Navigation from '@/components/Navigation';
import { Blog, defaultBlog } from '@/pages/blogs/index';
import { relative } from "path";


interface Comment {
    id: number;
    content: string;
    flags: number;
    up: number;
    down: number;
    hide: boolean;
    userID: number;
    blogID: number;
    parentCommentID: number;
    user: { id: number; username: string; avatar: number };
    CommentReport: [];
}

interface CommentRating {
    id: number,
    userID: number,
    commentID: number,
    upvote: boolean,
    downvote: boolean
}

interface NestedComment extends Comment {
    children: NestedComment[];
}

interface CommentRatingStorage {
    upvote: boolean;
    downvote: boolean;
}

export default function BlogPost() {

    const [blog, setBlog] = useState<Blog>(defaultBlog);
    const [username, setUsername] = useState<String>("");
    const [authorMatch, setAuthorMatch] = useState(false);
    const [ratingNum, setRatingNum] = useState<Number>(0);

    // blog ratings
    const [tempUpvote, setTempUpvote] = useState(false);
    const [tempDownvote, setTempDownvote] = useState(false);
    const [upvote, setUpvote] = useState(false);
    const [downvote, setDownvote] = useState(false);

    // comment ratings
    const [commentRatingNums, setCommentRatingNums] = useState<Map<number, number>>(new Map<number, number>());
    const [commentRatings, setCommentRatings] = useState<CommentRating[]>([]);

    const [comments, setComments] = useState<Comment[]>([]);
    const [nestedComments, setNestedComments] = useState<NestedComment[]>([]);
    const [newComments, setNewComments] = useState<Map<number, string>>(new Map<number, string>());
    const [reloadComments, setReloadComments] = useState(false);

    const [sortMethod, setSortMethod] = useState("valued");

    const router = useRouter();
    const { blogID } = router.query;
    const numID = Number(blogID);

    // fetch blog info from api
    const fetchBlog = async () => {
        try {
            await fetch(`/api/user/blogs/${numID}`, {
                method: "GET"
            })
                .then((response) => response.json())
                .then((b: Blog) => {
                    setBlog(b);
                    setRatingNum(b.up - b.down);
                });
        }
        catch (error) {
            router.push(`/blogs`);
        }
    };

    // fetch blog, set rating only
    const fetchBlogOnlyRating = async () => {
        await fetch(`/api/user/blogs/${numID}`, {
            method: "GET"
        })
            .then((response) => response.json())
            .then((b: Blog) => {
                setRatingNum(b.up - b.down);
            });
    };

    // fetch info of the visitor/user on the page
    const fetchVisitor = async () => {
        const loggedIn = localStorage.getItem("accessToken");
        if (loggedIn) {
            await fetch(`/api/user/protected_test`, {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` }
            })
                .then((response) => response.json())
                .then((visitor: { username: String, name: String, email: String, avatar: Number, phoneNumber: Number }) => {
                    setUsername(visitor.username);
                });
        }
    }

    // check if the user matches the author - if not, should not show edit or delete buttons
    function checkAuthorMatch() {
        if (blog.user.username === username && blog.id !== 0 && username !== "") {
            setAuthorMatch(true);
        }
        else {
            setAuthorMatch(false);
        }
    }

    // delete blog post
    const deleteBlog = async () => {
        const loggedIn = localStorage.getItem("accessToken");

        // theoretically should not have to encounter login error, since otherwise the button won't be visible
        if (loggedIn) {
            const response = await fetch(`/api/user/blogs/${numID}`,
                { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` } }
            );

            if (response.ok) {
                alert("Successfully deleted");
                router.push(`/blogs`);
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

    // edit and delete buttons
    function AuthorButtons(props: { show: boolean }) {
        if (props.show === true) {
            return (
                <div className="flex flex-row gap-2 mb-4">
                    <button className="bg-sky-300 border-2 rounded-md p-2"
                        onClick={(e) => router.push(`/blogs/${blogID}/edit-blog`)}>Edit Blog</button>
                    <button className="bg-red-400 border-2 rounded-md p-2"
                        onClick={deleteDialog}>Delete Blog</button>
                </div>
            )
        }
        else {
            return <div></div>
        }
    }

    // dialog that appears when the user tries to delete
    const deleteDialog = async () => {
        if (confirm('Are you sure you want to delete this blog?')) {
            await deleteBlog();
        }
    }

    // get blog rating info from api
    const fetchBlogRating = async () => {
        const loggedIn = localStorage.getItem("accessToken");
        if (loggedIn) {
            try {
                const result = await fetch(`/api/user/blogs/${numID}/ratings`, {
                    method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` }
                });
                if (result.ok) {
                    await result.json()
                        .then((response: { id: number, userID: number, blogID: number, upvote: boolean, downvote: boolean }) => {
                            setUpvote(response.upvote);
                            setDownvote(response.downvote);
                            setTempUpvote(response.upvote);
                            setTempDownvote(response.downvote);
                        });
                }
            }
            catch (error: any) {
                alert(error.toString());
            }
        }
    }

    // upvote blog ui
    const changeUpvoteUI = () => {
        const change = document.querySelectorAll(".upvote.blogRatings");
        if (upvote) {
            change[0].classList.add("rateSelected");
        }
        else {
            change[0].classList.remove("rateSelected");
        }
    }

    // downvote blog ui
    const changeDownvoteUI = () => {
        const change = document.querySelectorAll(".downvote.blogRatings");
        if (downvote) {
            change[0].classList.add("rateSelected");
        }
        else {
            change[0].classList.remove("rateSelected");
        }
    }

    // upvote or downvote blog post
    const tryRating = async (up: boolean, down: boolean, type: string) => {

        const loggedIn = localStorage.getItem("accessToken");

        // preventing weird cases
        if (type === "upvote") {
            if (up === upvote) {
                setTempUpvote(upvote);
                return;
            }
            if (up === downvote && up === true) {
                setTempUpvote(upvote);
                return;
            }
        }
        else if (type === "downvote") {
            if (down === downvote) {
                setTempDownvote(downvote);
                return;
            }
            if (down === upvote && down === true) {
                setTempDownvote(downvote);
                return;
            }
        }

        const response = await fetch(`/api/user/blogs/${numID}`,
            {
                method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` },
                body: JSON.stringify({
                    "upvote": up,
                    "downvote": down
                }),
            }
        );

        if (response.ok) {
            if (type === "upvote") { setUpvote(up); }
            else if (type === "downvote") { setDownvote(down); }

        }
        else {
            const data = await response.json();
            alert(data.error);
            if (type === "upvote") { setTempUpvote(upvote); }
            else if (type === "downvote") { setTempDownvote(downvote); }
        }

    }

    // get comments from api
    const fetchComments = async () => {
        const searchRequest = new URLSearchParams();
        searchRequest.append("sort", sortMethod);
        await fetch(`/api/user/blogs/${numID}/comments?${searchRequest.toString()}`, {
            method: "GET"
        })
            .then((response) => response.json())
            .then((c: Comment[]) => {
                setComments(c);
                c.forEach((cItem) => (commentRatingNums.set(cItem.id, (cItem.up - cItem.down))));
            });
    };


    const fetchCommentRatings = async () => {
        const loggedIn = localStorage.getItem("accessToken");
        if (loggedIn) {

            try {
                const result = await fetch(`/api/user/blogs/${numID}/comments/ratings`, {
                    method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` }
                });

                if (result.ok) {
                    await result.json()
                        .then((response: CommentRating[]) => {
                            setCommentRatings(response);
                        });
                }
            }
            catch (error: any) {
                alert(error.toString());
            }

        }

    }

    // upvote comment ui
    function changeCommentUpvoteUI(id: number) {
        const filteredRatings = commentRatings.filter((c) => c.commentID === id);
        if (filteredRatings.length > 0) {
            const item = filteredRatings[0];
            if (item.upvote === true) {
                return "rateSelected"
            }
            else if (item.upvote === false) {
                return "";
            }

        }
        return "";

    }

    // change downvote ui
    const changeCommentDownvoteUI = (id: number) => {
        const filteredRatings = commentRatings.filter((c) => c.commentID === id);
        if (filteredRatings.length > 0) {
            const item = filteredRatings[0];
            if (item.downvote === true) {
                return "rateSelected"
            }
            else if (item.downvote === false) {
                return "";
            }

        }
        return "";
    }

    const toggleCommentUpvote = async (id: number) => {
        const loggedIn = localStorage.getItem("accessToken");
        if (!loggedIn) {
            alert("please log in");
        }
        const filteredRatings = commentRatings.filter((c) => c.commentID === id);
        let attemptedChange;
        if (filteredRatings.length > 0) {
            const item = filteredRatings[0];

            attemptedChange = !item.upvote;

            if (attemptedChange == true && item.downvote === true) {
                return;
            }

        }
        else {
            attemptedChange = true;
        }

        const response = await fetch(`/api/user/blogs/${numID}/comments/${id}`,
            {
                method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` },
                body: JSON.stringify({
                    "upvote": attemptedChange,
                    "downvote": false
                }),
            }
        );

        if (response.ok) {
            fetchComments();
            fetchCommentRatings();
        }
        else {
            const data = await response.json();
            alert(data.error);
        }
    }


    const toggleCommentDownvote = async (id: number) => {
        const loggedIn = localStorage.getItem("accessToken");
        if (!loggedIn) {
            alert("please log in");
        }
        const filteredRatings = commentRatings.filter((c) => c.commentID === id);
        let attemptedChange;
        if (filteredRatings.length > 0) {
            const item = filteredRatings[0];

            attemptedChange = !item.downvote;

            if (attemptedChange == true && item.upvote === true) {
                return;
            }

        }
        else {
            attemptedChange = true;
        }

        const response = await fetch(`/api/user/blogs/${numID}/comments/${id}`,
            {
                method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` },
                body: JSON.stringify({
                    "upvote": false,
                    "downvote": attemptedChange
                }),
            }
        );

        if (response.ok) {
            fetchComments();
            fetchCommentRatings();
        }
        else {
            const data = await response.json();
            alert(data.error);
        }
    }

    // change comment data into a more useful structure   
    // logic from https://stackoverflow.com/questions/36829778/rendering-nested-threaded-comments-in-react
    function restructureComments() {
        let nestedComments: NestedComment[] = [];

        comments.forEach((c) => nestedComments = nestedComments.concat([
            { ...c, children: [] }
        ]));

        comments.forEach((c) => {
            if (c.parentCommentID !== null) {
                // get the parent comment, and add the current comment as its child
                let parentComment = nestedComments.filter((nc) => nc.id === c.parentCommentID)[0];
                parentComment.children = (parentComment.children).concat([{ ...c, children: [] }]);
            }
        })
        setNestedComments(nestedComments);
    }

    const addComment = async (id: number) => {

        const commentToAdd = newComments.get(id);

        const loggedIn = localStorage.getItem("accessToken");

        // theoretically should not have to encounter login error, since checkLogggedIn is executed earlier
        if (loggedIn) {

            let commentObject: any = { content: commentToAdd };
            if (id !== -1) {
                commentObject = { content: commentToAdd, parentCommentID: id }
            }

            const response = await fetch(`/api/user/blogs/${numID}/comments`,
                {
                    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` },
                    body: JSON.stringify(commentObject),
                }
            );

            if (response.ok) {
                alert("successfully saved");
                setReloadComments(!reloadComments);
            }
            else {
                const data = await response.json();
                alert(data.error);
            }
        }
        else {
            alert("please log in");
        }
    }

    function initializeNewComments() {
        let newCommentMap = new Map<number, string>();
        comments.forEach((c) => (newCommentMap.set(c.id, "")));
    }

    function NestedComment(props: { head: number, parent: any, id: number, author: string, avatar: number, content: string }) {

        let parentCheck = false;

        if (props.head === -1) {
            parentCheck = (props.parent === null);
        }
        else {
            parentCheck = (props.parent === props.head);
        }

        if (parentCheck) {
            return (
                <div>
                    <div className="border-2 p-2 rounded-md ">
                        <div className="flex flex-row">
                            <div className="flex flex-row gap-2 items-center border-2 p-1 rounded-md bg-gray-200">
                                <div className="bg-gray-400 p-1 rounded-md">{props.avatar}</div>
                                <div>{props.author}</div>
                            </div>
                            <div className="flex ml-4 items-center">{props.content}</div>
                        </div>
                        <div className="ratings flex flex-row items-center mt-2 mb-2">
                            <button id={`commentUpvote${props.id}`}
                                className={`rateButton upvote commentRatings ${changeCommentUpvoteUI(props.id)}`}
                                onClick={(e) => toggleCommentUpvote(props.id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="fill-black">
                                    <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
                                </svg>
                            </button>
                            <div className="ml-2 mr-2">{commentRatingNums.get(props.id)}</div>
                            <button id={`commentDownvote${props.id}`}
                                className={`rateButton downvote commentRatings ${changeCommentDownvoteUI(props.id)}`}
                                onClick={(e) => toggleCommentDownvote(props.id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="fill-black">
                                    <path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z" />
                                </svg>
                            </button>

                        </div>
                        <div>Reply</div>
                        <input type="text" className="blogSearch w-full" onKeyDown={(e) => { if (e.key === 'Enter') { addComment(props.id) } }}
                            onChange={(e) => (setNewComments(newComments.set(props.id, e.target.value)))}>{newComments.get(props.id)}</input>
                    </div>
                    <div className="flex flex-row">
                        <div className="w-10 flex-none"></div>
                        <div className="flex-1">
                            {nestedComments.map((c) => (
                                <div key={c.id}>
                                    <NestedComment
                                        head={props.id}
                                        parent={c.parentCommentID}
                                        id={c.id}
                                        author={c.user.username}
                                        avatar={c.user.avatar}
                                        content={c.content}>
                                    </NestedComment>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return <div></div>
        }
    }


    useEffect(() => {
        if (!blogID) {
            return;
        }
        fetchBlog()
        fetchVisitor();
        fetchComments();
        fetchBlogRating();
        fetchCommentRatings();
    }, [blogID]);

    useEffect(() => {
        if (!blogID) {
            return;
        }
        checkAuthorMatch();
    }, [username, blog]);

    useEffect(() => {
        if (!blogID) {
            return;
        }
        if (!comments) {
            return;
        }
        restructureComments();
        initializeNewComments();
    }, [comments]);

    useEffect(() => {
        if (!blogID) {
            return;
        }
        fetchComments();
        fetchCommentRatings();
    }, [reloadComments]);

    // rating effects 
    useEffect(() => {
        if (tempUpvote === true) {
            tryRating(true, false, "upvote");
        }
        else if (tempUpvote === false) {
            tryRating(false, false, "upvote");
        }
    }, [tempUpvote]);

    useEffect(() => {
        if (tempDownvote === true) {
            tryRating(false, true, "downvote");
        }
        else if (tempDownvote === false) {
            tryRating(false, false, "downvote");
        }
    }, [tempDownvote]);

    useEffect(() => {
        if (!blogID) {
            return;
        }
        fetchBlogOnlyRating();
        changeUpvoteUI();
    }, [upvote]);

    useEffect(() => {
        if (!blogID) {
            return;
        }
        fetchBlogOnlyRating();
        changeDownvoteUI();
    }, [downvote]);

    return (
        <div className="h-screen flex flex-col">
            <Navigation></Navigation>
            <div className="p-4">
                <AuthorButtons show={authorMatch}></AuthorButtons>
                <div className="blogSearchTitle">
                    {blog.title}
                </div>
                <div className="flex flex-row">
                    <div className="flex flex-row gap-2 items-center border-2 p-1 rounded-md bg-gray-200">
                        <div className="bg-gray-400 p-1 rounded-md">{blog.user.avatar}</div>
                        <div>{blog.user.username}</div>
                    </div>
                </div>

                <div className="flex flex-row gap-2 flex-wrap mt-2">
                    {blog.tags.map((t) => (
                        <div key={t.id} className="tagItem flex flex-row gap-2">
                            {t.tag}
                        </div>
                    ))}
                </div>

                <div className="mt-2">Templates:</div>
                <div className="flex flex-row gap-2 flex-wrap mt-2">
                    {blog.templates.map((c) => (
                        <div key={`template${c.id}`} className="flex flex-row gap-2 flatItem">
                            <div onClick={(e) => router.push(`/code_templates/${c.id}`)}>{`${c.id}: ${c.title}`}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="ratings p-4 border-2 flex flex-row items-center">
                <button className="rateButton upvote blogRatings"
                    onClick={(e) => setTempUpvote(!upvote)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="fill-black">
                        <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
                    </svg>
                </button>
                <div className="ml-2 mr-2">{Number(ratingNum)}</div>
                <button className="rateButton downvote blogRatings"
                    onClick={(e) => setTempDownvote(!downvote)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="fill-black">
                        <path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z" />
                    </svg>
                </button>
            </div>
            <div className="p-4 bg-green-100">{blog.content}</div>
            <div className="p-4">

                <div className="blogSearchTitle text-green-700">Comments</div>
                <div className="flex flex-row">
                    <div>Sort by:</div>
                    <div className="ml-2">
                        <select id="sort-filter" onChange={(e) => {
                            setSortMethod(e.target.value);
                            setReloadComments(!reloadComments);
                        }
                        }>
                            <option>valued</option>
                            <option>recent</option>
                            <option>controversial</option>
                        </select>
                    </div>

                </div>

                <div className="border-2 p-2 rounded-md mt-2">

                    <div>Write a comment</div>
                    <input type="text" className="blogSearch w-full" onKeyDown={(e) => { if (e.key === 'Enter') { addComment(-1) } }}
                        onChange={(e) => (setNewComments(newComments.set(-1, e.target.value)))}></input>
                </div>
                <div>
                    {nestedComments.map((c) => (
                        <div key={c.id} className="hi">
                            <NestedComment
                                head={-1}
                                parent={c.parentCommentID}
                                id={c.id}
                                author={c.user.username}
                                avatar={c.user.avatar}
                                content={c.content}>
                            </NestedComment>
                        </div>
                    ))}
                </div>
                <div>

                </div>

            </div>
        </div >
    );
}