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
            res.status(401).json({ error: "Please log in" });
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

            const newPostID = newPost.id;
            const selectnewPost = await prisma.blog.findUnique({
                where: {
                    id: newPostID,
                },
                include: {
                    difference: false,
                    absDifference: false,
                    tags: true,
                    templates: true
                }
            })

            return res.status(201).json(selectnewPost);
        }

        catch (error) {
            return res.status(403).json({ error: "Could not create blog post" });
        }
    }

    // SEARCHING FOR BLOG POSTS AND SORT
    else if (req.method === "GET") {

        const title = req.query.title;
        const content = req.query.content;
        let page = Number(req.query.page);

        const pageSize = 10;

        if (!page) {
            page = 1;
        }

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
        if (adminV[0]) {
            orCheck = [{ hide: false }, { hide: true }]
        }

        let andCheck = [
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
        ];

        let includeComponents = {
            user: {
                include: {
                    password: false,
                    name: false,
                    email: false,
                    phoneNumber: false,
                    role: false,
                }
            },
            difference: false,
            absDifference: false,
            tags: true,
            templates: true,
            BlogReport: {
                include: {
                    userID: false,
                    blogID: false,
                }
            }
        }
        let whereCheck;

        if (req.query.username) {
            whereCheck = {
                title: { contains: (title || ''), },
                content: { contains: (content || ''), },
                user: {
                    username: req.query.username,
                },
                OR: orCheck,
                AND: andCheck,
            }
        }
        else {
            whereCheck = {
                title: { contains: (title || ''), },
                content: { contains: (content || ''), },
                OR: orCheck,
                AND: andCheck,
            }
        }

        // filtered search
        try {

            let result;
            if (sortMethod === "valued") {
                // ordered by difference = upvotes - downvotes
                // in the case of a tie, the blog with more upvotes is higher
                result = await prisma.blog.findMany({
                    where: whereCheck,
                    orderBy: [
                        { difference: 'desc' },
                        { up: 'desc' },
                    ],
                    include: includeComponents
                })
            }
            else if (sortMethod === "controversial") {
                // ordered by absDifference = |upvotes - downvotes| --> smaller the difference, the more controversial it is
                // in the case of a tie, the blog with more upvotes is higher
                result = await prisma.blog.findMany({
                    where: whereCheck,
                    orderBy: [
                        { absDifference: 'asc' },
                        { up: 'desc' },
                    ],
                    include: includeComponents
                })
            }
            else {
                result = await prisma.blog.findMany({
                    where: whereCheck,
                    orderBy: [
                        { id: 'desc' }
                    ],
                    include: includeComponents
                })
            }

            return res.status(200).json(paginateArray(result, pageSize, page));
        }
        catch (error) {
            return res.status(403).json({ error: "Could not search for blog posts" });
        }

    }

    else {
        return res.status(403).json({ error: "Method not allowed" });
    }



}

export function paginateArray(arr, pageSize, pageNumber) {
    // formulas for getting the start and end index of the page that needs to be printed
    let startIndex = pageSize * (pageNumber - 1);
    let endIndex = pageSize * pageNumber - 1;

    // check out of bounds
    if (endIndex + 1 > arr.length) {
        endIndex = Math.min(endIndex, arr.length - 1);
    }
    if (startIndex + 1 > arr.length) {
        return [];
    }
    // return a slice of the array based on indices
    return arr.slice(startIndex, endIndex + 1);
}