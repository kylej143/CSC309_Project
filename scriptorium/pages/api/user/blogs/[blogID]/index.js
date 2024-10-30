import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    let { blogID } = req.query;
    let id = Number(blogID);

    const userV = await token_handler(req, res);
    const ratings = [true, false]

    // EDITING BLOG POSTS
    if (req.method === "PUT" && !(ratings.includes(req.body.upvote) || ratings.includes(req.body.downvote))) {
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

    // UPVOTE/DOWNVOTE BLOG POSTS
    else if (req.method === "PUT" && (ratings.includes(req.body.upvote) || ratings.includes(req.body.downvote))) {

        // Ensure user is logged in
        if (!userV) {
            return res.status(400).json({ "error": "Please log in" });
        }

        const userID = Number(userV.id);

        // Check valid rating
        if ((req.body.upvote && !ratings.includes(req.body.upvote)) || (req.body.downvote && !ratings.includes(req.body.downvote))) {
            return res.status(400).json({ "message": "Invalid rating" });
        }

        const upvote = (req.body.upvote === true);
        const downvote = (req.body.downvote === true);

        // Cannot both upvote and downvote a post
        if (upvote && downvote) {
            return res.status(200).json({ "message": "Cannot upvote and downvote same post" });
        }

        // Update or create rating
        try {
            // 1) if the rating already exists, set everything to false - this 
            // ensures that the new rating does not "combine" with the old rating
            // to create a true-true situation. if the rating does not exist, make it.
            await prisma.blogRating.upsert({
                where: {
                    userID_blogID: {
                        userID: userID,
                        blogID: id
                    }
                },
                update: {
                    upvote: false,
                    downvote: false,
                },
                create: {
                    user: {
                        connect: { id: userID },
                    },
                    blog: {
                        connect: { id: id },
                    }
                },
            })

            // 2) make the rating
            const rating = await prisma.blogRating.update({
                where: {
                    userID_blogID: {
                        userID: userID,
                        blogID: id
                    }
                },
                data: {
                    upvote: upvote,
                    downvote: downvote
                }
            })

            // If upvote and downvote are both false, then we should delete the rating
            if (rating.upvote === false && rating.downvote === false) {
                await prisma.blogRating.delete({
                    where: {
                        userID_blogID: {
                            userID: userID,
                            blogID: id
                        }
                    }
                })
                return res.status(200).json({ "message": "Removed rating" })
            }

            return res.status(200).json(rating);
        }
        catch (error) {
            return res.status(400).json({ "message": "Could not make rating" })
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
