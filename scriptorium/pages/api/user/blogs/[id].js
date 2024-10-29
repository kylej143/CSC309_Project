import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    let { id } = req.query;
    id = Number(id);

    const userV = await token_handler(req, res);

    // EDITING BLOG POSTS
    if (req.method === "PUT") {

        // Ensure user is logged in
        if (!userV) {
            return res.status(400).json({ "error": "Please log in" });
        }

        const { title, content, tags, templates } = req.body;

        try {
            let updatedPost = await prisma.blog.findUnique({
                where: {
                    id,
                }
            });

            if (!updatedPost) {
                return res.status(400).json({ "error": "Blog post does not exist" });
            }

            // Check that the post actually belongs to the user - else, exit
            if (Number(updatedPost.userID) != Number(userV.id)) {
                return res.status(400).json({ "error": "No permission to edit the selected blog post" });
            }

            // Make updates
            if (title) {
                updatedPost = await prisma.blog.update({
                    where: {
                        id,
                    },
                    data: {
                        title: title,
                    }
                })
            }

            if (content) {
                updatedPost = await prisma.blog.update({
                    where: {
                        id,
                    },
                    data: {
                        content: content,
                    }
                })
            }

            if (tags) {

                // disconnect existing tags
                await prisma.blog.update({
                    where: {
                        id,
                    },
                    data: {
                        tags: {
                            set: [],
                        }
                    }
                })

                // add or re-add tags
                updatedPost = await prisma.blog.update({
                    where: {
                        id,
                    },
                    data: {
                        tags: {
                            connectOrCreate: tags.map((t) => ({
                                where: {
                                    tag: t,
                                },
                                create: {
                                    tag: t,
                                }
                            }))
                        }
                    }
                })

                // remove unused tags from database
                await prisma.tag.deleteMany({
                    where: {
                        blogs: {
                            none: {},
                        },
                    }
                })
            }

            if (templates) {

                // disconnect existing templates
                await prisma.blog.update({
                    where: {
                        id,
                    },
                    data: {
                        templates: {
                            set: [],
                        }
                    }
                })

                // add or re-add templates
                let parsedTemplates = templates.map((c) => Number(c));
                updatedPost = await prisma.blog.update({
                    where: {
                        id,
                    },
                    data: {
                        templates: {
                            connect: parsedTemplates.map((c) => ({
                                id: c,
                            }))
                        }
                    }
                })
            }

            return res.status(200).json(updatedPost);
        }

        catch (error) {
            return res.status(400).json({ "message": "Could not update blog post" });
        }

    }

    // DELETING BLOG POSTS
    else if (req.method === "DELETE") {

        // Ensure user is logged in
        if (!userV) {
            return res.status(400).json({ "error": "Please log in" });
        }

        try {
            const blogExists = await prisma.blog.findUnique({
                where: {
                    id
                }
            })

            if (!blogExists) {
                return res.status(400).json({ "error": "Blog post does not exist" });
            }

            // Check that the post actually belongs to the user - else, exit
            if (Number(blogExists.userID) != Number(userV.id)) {
                return res.status(400).json({ "error": "No permission to delete the selected blog post" });
            }

            // delete the post
            await prisma.blog.delete({
                where: {
                    id,
                },
            })

            // remove unused tags
            await prisma.tag.deleteMany({
                where: {
                    blogs: {
                        none: {},
                    },
                }
            })

            return res.status(200).json({ "message": "Blog post deleted" });
        }
        catch (error) {
            return res.status(400).json({ "message": "Could not delete blog post" });
        }

    }

    // GET BLOG POST BY ID
    else if (req.method === "GET") {

        try {
            const result = await prisma.blog.findUnique({
                where: {
                    id,
                }
            })

            if (result) {
                return res.status(200).json(result);
            }
            else {
                return res.status(400).json({ "message": "Blog post does not exist" });
            }
        }
        catch (error) {
            return res.status(400).json({ "message": "Could not get blog post" });
        }

    }

    else {
        return res.status(200).json({ "message": "Method not allowed" });
    }

}
