import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
import admin_token_handler from '@/pages/api/admin/protected';
import { paginateArray } from '@/pages/api/user/blogs/index.js';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    let { blogID } = req.query;
    blogID = Number(blogID);

    const userV = await token_handler(req, res);
    const adminV = await admin_token_handler(req, res);

    // WRITE A NEW COMMENT
    if (req.method === "POST") {

        // ensure user is logged in
        if (!userV) {
            res.status(401).json({ error: "Please log in" });
        }

        let parsedId = Number(userV.id);

        const { content, parentCommentID } = req.body;
        let newComment;
        try {
            // write a new comment
            if (!parentCommentID) {
                newComment = await prisma.comment.create({
                    data: {
                        content,
                        user: {
                            connect: {
                                id: parsedId,
                            }
                        },
                        blog: {
                            connect: {
                                id: blogID,
                            }
                        },
                    }
                })
            }
            // reply to an existing comment
            else {
                let parsedParentID = Number(parentCommentID)

                // check if parent comment exists
                const checkParent = await prisma.comment.findUnique({
                    where: {
                        id: parsedParentID,
                    }
                })

                if (!checkParent) {
                    return res.status(404).json({ error: "Parent comment does not exist" });
                }

                // check if parent comment is in the same blog post
                const checkParentBlog = await prisma.blog.findFirst({
                    where: {
                        comments: {
                            some: { id: parsedParentID }
                        }
                    }
                })

                if (checkParentBlog.id != blogID) {
                    return res.status(404).json({ error: "Cannot respond to selected comment" });
                }

                // write comment
                newComment = await prisma.comment.create({
                    data: {
                        content,
                        user: {
                            connect: {
                                id: parsedId,
                            }
                        },
                        blog: {
                            connect: {
                                id: blogID,
                            }
                        },
                        parentComment: {
                            connect: {
                                id: parsedParentID,
                            }
                        },
                    }
                })
            }
        }
        catch (error) {
            return res.status(403).json({ error: "Could not write comment" });
        }

        return res.status(201).json(newComment);

    }

    // SORT COMMENTS
    else if (req.method === "GET" && req.query.show !== "all") {
        let sortMethod = req.query.sort;
        let page = req.query.page;
        console.log("restricted");

        if (sortMethod !== "valued" && sortMethod !== "controversial" && sortMethod !== "recent") {
            sortMethod = "valued"
        }

        const pageSize = 10;

        if (!page) {
            page = 0; // changed
        }

        // ensures that if the comment is hidden, it will not be visible
        // except to the original author
        let userLogID = -1;
        if (userV) {
            userLogID = userV.id;
        }

        let orCheck = [{ hide: false }, { userID: userLogID }]
        // admin should be able to see anything
        if (adminV[0]) {
            orCheck = [{ hide: false }, { hide: true }]
        }

        try {
            let comments;

            if (sortMethod === "valued") {
                // ordered by difference = upvotes - downvotes
                // in the case of a tie, the comment with more upvotes is higher
                comments = await prisma.comment.findMany({
                    where: {
                        blogID: blogID,
                        OR: orCheck,
                    },
                    orderBy: [
                        { difference: 'desc' },
                        { up: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                        user: {
                            include: {
                                password: false,
                                name: false,
                                email: false,
                                phoneNumber: false,
                                role: false,
                            }
                        },
                        CommentReport: {
                            include: {
                                userID: false,
                                commentID: false,
                            }
                        }
                    }
                })
            }
            else if (sortMethod === "controversial") {
                // ordered by absDifference = |upvotes - downvotes| --> smaller the difference, the more controversial it is
                // in the case of a tie, the comment with more upvotes is higher
                comments = await prisma.comment.findMany({
                    where: {
                        blogID: blogID,
                        OR: orCheck,
                    },
                    orderBy: [
                        { absDifference: 'asc' },
                        { up: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                        user: {
                            include: {
                                password: false,
                                name: false,
                                email: false,
                                phoneNumber: false,
                                role: false,
                            }
                        },
                        CommentReport: {
                            include: {
                                userID: false,
                                commentID: false,
                            }
                        }
                    }
                })
            }
            else {
                comments = await prisma.comment.findMany({
                    where: {
                        blogID: blogID,
                        OR: orCheck,
                    },
                    orderBy: [
                        { id: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                        user: {
                            include: {
                                password: false,
                                name: false,
                                email: false,
                                phoneNumber: false,
                                role: false,
                            }
                        },
                        CommentReport: {
                            include: {
                                userID: false,
                                commentID: false,
                            }
                        }
                    }
                })
            }
            if (page === 0) {
                return res.status(200).json(comments)
            }
            else {
                return res.status(200).json(paginateArray(comments, pageSize, page))
            }
        }
        catch (error) {
            return res.status(403).json({ error: "Could not get comments" });
        }

    }

    else if (req.method === "GET" && req.query.show === "all") {
        let sortMethod = req.query.sort;
        let page = req.query.page;

        if (sortMethod !== "valued" && sortMethod !== "controversial" && sortMethod !== "recent") {
            sortMethod = "valued"
        }

        const pageSize = 10;

        if (!page) {
            page = 0; // changed
        }

        let orCheck = [{ hide: false }, { hide: true }]

        try {
            let comments;

            if (sortMethod === "valued") {
                // ordered by difference = upvotes - downvotes
                // in the case of a tie, the comment with more upvotes is higher
                comments = await prisma.comment.findMany({
                    where: {
                        blogID: blogID,
                        OR: orCheck,
                    },
                    orderBy: [
                        { difference: 'desc' },
                        { up: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                        user: {
                            include: {
                                password: false,
                                name: false,
                                email: false,
                                phoneNumber: false,
                                role: false,
                            }
                        },
                        CommentReport: {
                            include: {
                                userID: false,
                                commentID: false,
                            }
                        }
                    }
                })
            }
            else if (sortMethod === "controversial") {
                // ordered by absDifference = |upvotes - downvotes| --> smaller the difference, the more controversial it is
                // in the case of a tie, the comment with more upvotes is higher
                comments = await prisma.comment.findMany({
                    where: {
                        blogID: blogID,
                        OR: orCheck,
                    },
                    orderBy: [
                        { absDifference: 'asc' },
                        { up: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                        user: {
                            include: {
                                password: false,
                                name: false,
                                email: false,
                                phoneNumber: false,
                                role: false,
                            }
                        },
                        CommentReport: {
                            include: {
                                userID: false,
                                commentID: false,
                            }
                        }
                    }
                })
            }
            else {
                comments = await prisma.comment.findMany({
                    where: {
                        blogID: blogID,
                        OR: orCheck,
                    },
                    orderBy: [
                        { id: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                        user: {
                            include: {
                                password: false,
                                name: false,
                                email: false,
                                phoneNumber: false,
                                role: false,
                            }
                        },
                        CommentReport: {
                            include: {
                                userID: false,
                                commentID: false,
                            }
                        }
                    }
                })
            }
            if (page === 0) {
                return res.status(200).json(comments)
            }
            else {
                return res.status(200).json(paginateArray(comments, pageSize, page))
            }
        }
        catch (error) {
            return res.status(403).json({ error: "Could not get comments" });
        }

    }

    else {
        return res.status(403).json({ error: "Method not allowed" });
    }

}