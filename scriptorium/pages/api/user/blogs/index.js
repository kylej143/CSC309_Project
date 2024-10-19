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

    else {
        return res.status(200).json({ "message": "Method not allowed" });
    }



}