import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
import admin_token_handler from '@/pages/api/admin/protected';
const prisma = new PrismaClient();


export default async function handler(req, res) {

    const userV = await token_handler(req, res);
    const adminV = await admin_token_handler(req, res);

    // CREATING BLOG POSTS
    if (req.method === "POST") {

        // Ensure user is logged in
        if (!userV) {
            res.status(400).json({ "error": "Please log in" });
        }

        let parsedId = Number(userV.id);

        const { title, content, tags, templates } = req.body;
        let newPost;

        // Make the blog post
        try {
            if (!templates) {
                newPost = await prisma.blog.create({
                    data: {
                        title,
                        content,
                        tags: {
                            connectOrCreate: tags.map((t) => ({
                                where: {
                                    tag: t,
                                },
                                create: {
                                    tag: t,
                                }
                            }))
                        },
                        user: {
                            connect: {
                                id: parsedId,
                            }
                        },
                    }
                })
            }
            else {
                let parsedTemplates = templates.map((c) => Number(c));
                newPost = await prisma.blog.create({
                    data: {
                        title,
                        content,
                        tags: {
                            connectOrCreate: tags.map((t) => ({
                                where: {
                                    tag: t,
                                },
                                create: {
                                    tag: t,
                                }
                            }))
                        },
                        templates: {
                            connect: parsedTemplates.map((c) => ({
                                id: c,
                            }))
                        },
                        user: {
                            connect: {
                                id: parsedId,
                            }
                        },
                    }
                })
            }
            return res.status(201).json(newPost);
        }

        catch (error) {
            return res.status(400).json({ "error": "Could not create blog post" });
        }
    }

    // SEARCHING FOR BLOG POSTS AND SORT
    else if (req.method === "GET") {

        const title = req.query.title;
        const content = req.query.content;

        // create a list of tags from query
        let tags = [];
        if (req.query.tags) {
            if (Array.isArray(req.query.tags)) {
                tags = req.query.tags;
            }
            else {
                tags.push(String(req.query.tags));
            }
        }

        // create a list of code template ids from query
        let templates = [];
        if (req.query.templates) {
            if (Array.isArray(req.query.templates)) {
                templates = (req.query.templates).map((c) => Number(c));
            }
            else {
                templates.push(Number(req.query.templates));
            }
        }

        // sort method
        let sortMethod = req.query.sort;
        if (sortMethod !== "valued" && sortMethod !== "controversial" && sortMethod != "recent") {
            sortMethod = "valued"
        }

        // ensures that if the blog post is hidden, it will not show
        // except to the original author
        let userLogID = -1;
        if (userV) {
            userLogID = userV.id;
        }

        let orCheck = [{ hide: false }, { userID: userLogID }]

        // admin should be able to see anything
        // if (adminV) {
        //     orCheck = [{ hide: false }, { hide: true }]
        // }

        // filtered search
        try {

            let result;
            if (sortMethod === "valued") {
                // ordered by difference = upvotes - downvotes
                // in the case of a tie, the blog with more upvotes is higher
                result = await prisma.blog.findMany({
                    where: {
                        title: { contains: (title || ''), },
                        content: { contains: (content || ''), },
                        OR: orCheck,
                        AND: [
                            {
                                AND: tags.map((t) => ({
                                    tags: {
                                        some: { tag: t }
                                    }
                                }))
                            },
                            {
                                AND: templates.map((c) => ({
                                    templates: {
                                        some: { id: c }
                                    }
                                }))
                            },
                        ]
                    },
                    orderBy: [
                        { difference: 'desc' },
                        { up: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                        templates: true,
                        BlogReport: {
                            include: {
                                userID: false,
                                blogID: false,
                            }
                        }
                    }
                })
            }
            else if (sortMethod === "controversial") {
                // ordered by absDifference = |upvotes - downvotes| --> smaller the difference, the more controversial it is
                // in the case of a tie, the blog with more upvotes is higher
                result = await prisma.blog.findMany({
                    where: {
                        title: { contains: (title || ''), },
                        content: { contains: (content || ''), },
                        OR: orCheck,
                        AND: [
                            {
                                AND: tags.map((t) => ({
                                    tags: {
                                        some: { tag: t }
                                    }
                                }))
                            },
                            {
                                AND: templates.map((c) => ({
                                    templates: {
                                        some: { id: c }
                                    }
                                }))
                            },
                        ],
                    },
                    orderBy: [
                        { absDifference: 'asc' },
                        { up: 'desc' },
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                        templates: true,
                        BlogReport: {
                            include: {
                                userID: false,
                                blogID: false,
                            }
                        }
                    }
                })
            }
            else {
                result = await prisma.blog.findMany({
                    where: {
                        title: { contains: (title || ''), },
                        content: { contains: (content || ''), },
                        OR: orCheck,
                        AND: [
                            {
                                AND: tags.map((t) => ({
                                    tags: {
                                        some: { tag: t }
                                    }
                                }))
                            },
                            {
                                AND: templates.map((c) => ({
                                    templates: {
                                        some: { id: c }
                                    }
                                }))
                            },
                        ],
                    },
                    orderBy: [
                        { id: 'desc' }
                    ],
                    include: {
                        difference: false,
                        absDifference: false,
                        templates: true,
                        BlogReport: {
                            include: {
                                userID: false,
                                blogID: false,
                            }
                        }
                    }
                })
            }

            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ "error": "Could not search for blog posts" });
        }

    }

    else {
        return res.status(400).json({ "error": "Method not allowed" });
    }



}