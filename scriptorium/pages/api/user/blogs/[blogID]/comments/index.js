import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    let { blogID } = req.query;
    blogID = Number(blogID);

    const userV = await token_handler(req, res);

    // WRITE A NEW COMMENT
    if (req.method === "POST") {

        // ensure user is logged in
        if (!userV) {
            res.status(400).json({ "error": "Please log in" });
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
                    return res.status(400).json({ "error": "Parent comment does not exist" });
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
                    return res.status(400).json({ "error": "Cannot respond to selected comment" });
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
            return res.status(400).json({ "message": "Could not write comment" });
        }

        return res.status(201).json(newComment);

    }

    // SORT COMMENTS
    else if (req.method === "GET") {
        let sortMethod = req.query.sort;
        if (sortMethod !== "valued" && sortMethod !== "controversial" && sortMethod !== "recent") {
            sortMethod = "valued"
        }

        try {
            let comments;

            if (sortMethod === "valued") {
                // ordered by difference = upvotes - downvotes
                // in the case of a tie, the comment with more upvotes is higher
                comments = await prisma.comment.findMany({
                    where: {
                        blogID: blogID,
                    },
                    orderBy: [
                        { difference: 'desc' },
                        { up: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                    }
                })
            }
            else if (sortMethod === "controversial") {
                // ordered by absDifference = |upvotes - downvotes| --> smaller the difference, the more controversial it is
                // in the case of a tie, the comment with more upvotes is higher
                comments = await prisma.comment.findMany({
                    where: {
                        blogID: blogID,
                    },
                    orderBy: [
                        { absDifference: 'asc' },
                        { up: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                    }
                })
            }
            else {
                comments = await prisma.comment.findMany({
                    where: {
                        blogID: blogID,
                    },
                    orderBy: [
                        { id: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                    }
                })
            }
            return res.status(200).json(comments)
        }
        catch (error) {
            return res.status(400).json({ "message": "Could not get comments" });
        }

    }

    else {
        return res.status(200).json({ "message": "Method not allowed" });
    }

}