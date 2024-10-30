import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
const prisma = new PrismaClient();


export default async function handler(req, res) {

    const userV = await token_handler(req, res);

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
            return res.status(400).json({ "message": "Could not create blog post" });
        }
    }

    // SEARCHING FOR BLOG POSTS
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

        // filtered search
        try {
            const result = await prisma.blog.findMany({
                where: {
                    title: { contains: (title || ''), },
                    content: { contains: (content || ''), },
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
                }
            })

            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ "message": "Could not search for blog posts" });
        }

    }

    else {
        return res.status(200).json({ "message": "Method not allowed" });
    }



}