import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export default async function handler(req, res) {

    // CREATING BLOG POSTS
    if (req.method === "POST") {
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
                                id: 1,
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
                                id: 1,
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

    else if (req.method = "PUT") {

    }


}