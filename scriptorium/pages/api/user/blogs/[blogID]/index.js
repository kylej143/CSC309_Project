import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
import admin_token_handler from '@/pages/api/admin/protected';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    let { blogID } = req.query;
    let id = Number(blogID);

    const userV = await token_handler(req, res);
    const adminV = await admin_token_handler(req, res);
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

            // If post is hidden, cannot edit
            if (updatedPost.hide === true && !adminV) {
                return res.status(400).json({ "error": "Cannot edit post that has been hidden by administrator" });
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
            return res.status(400).json({ "error": "Could not update blog post" });
        }

    }

    // UPVOTE/DOWNVOTE BLOG POSTS
    else if (req.method === "PUT" && (ratings.includes(req.body.upvote) || ratings.includes(req.body.downvote))) {

        // Ensure user is logged in
        if (!userV) {
            return res.status(400).json({ "error": "Please log in" });
        }

        const userID = Number(userV.id);

        // Ensure blog is not hidden
        const checkHidden = await prisma.blog.findUnique({
            where: {
                id: id,
            }
        })

        if (!checkHidden) {
            return res.status(400).json({ "error": "Cannot find blog" });
        }

        if (checkHidden.hide === true && !adminV) {
            return res.status(400).json({ "error": "Cannot rate blog" });
        }

        // Check valid rating
        if ((req.body.upvote && !ratings.includes(req.body.upvote)) || (req.body.downvote && !ratings.includes(req.body.downvote))) {
            return res.status(400).json({ "error": "Invalid rating" });
        }

        const upvote = (req.body.upvote === true);
        const downvote = (req.body.downvote === true);

        // Cannot both upvote and downvote a post
        if (upvote && downvote) {
            return res.status(400).json({ "error": "Cannot upvote and downvote same post" });
        }

        // Update or create rating
        try {

            // check if rating already exists
            const existingRating = await prisma.blogRating.findUnique({
                where: {
                    userID_blogID: {
                        userID: userID,
                        blogID: id
                    }
                }
            })

            let upvoteChange = 0;
            let downvoteChange = 0;
            let diffChange = 0;

            if (existingRating) {
                // false, true --> false, false
                // upvotechange = 0 - 0 = 0
                // downvotechange = 0 - 1 = -1               
                upvoteChange = Number(upvote) - Number(existingRating.upvote);
                downvoteChange = Number(downvote) - Number(existingRating.downvote);
                diffChange = calcUpvoteDifferenceChange(existingRating.upvote, existingRating.downvote, upvote, downvote);
            }
            else {
                upvoteChange = Number(upvote);
                downvoteChange = Number(downvote);
                diffChange = calcUpvoteDifferenceChange(false, false, upvote, downvote);
            }

            // if rating exists, update; if does not exist, make it
            const newRating = await prisma.blogRating.upsert({
                where: {
                    userID_blogID: {
                        userID: userID,
                        blogID: id
                    }
                },
                update: {
                    upvote: upvote,
                    downvote: downvote,
                },
                create: {
                    upvote: upvote,
                    downvote: downvote,
                    user: {
                        connect: { id: userID },
                    },
                    blog: {
                        connect: { id: id },
                    }
                },
            })

            // update upvotes, downvotes, and difference on associated blog post
            const associatedBlog = await prisma.blog.update({
                where: {
                    id: newRating.blogID,
                },
                data: {
                    up: { increment: upvoteChange },
                    down: { increment: downvoteChange },
                    difference: { increment: diffChange }
                }
            })

            // update absolute difference
            const absDifference = Math.abs(associatedBlog.difference);
            await prisma.blog.update({
                where: {
                    id: newRating.blogID,
                },
                data: {
                    absDifference: absDifference,
                }
            })


            // If upvote and downvote are both false, then we should delete the rating
            if (newRating.upvote === false && newRating.downvote === false) {
                await prisma.blogRating.delete({
                    where: {
                        userID_blogID: {
                            userID: userID,
                            blogID: id
                        }
                    }
                })
                return res.status(200).json({ "message": "Removed rating" });
            }

            return res.status(200).json(newRating);
        }
        catch (error) {
            return res.status(400).json({ "error": "Could not make rating" });
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

            // If post is hidden, cannot edit
            if (blogExists.hide === true && !adminV) {
                return res.status(400).json({ "error": "Cannot delete post that has been hidden by administrator" });
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
            return res.status(400).json({ "error": "Could not delete blog post" });
        }

    }

    // GET BLOG POST BY ID
    else if (req.method === "GET") {

        try {

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

            const result = await prisma.blog.findUnique({
                where: {
                    id: id,
                    OR: orCheck
                },
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

            if (result) {
                return res.status(200).json(result);
            }
            else {
                return res.status(400).json({ "error": "Blog post does not exist" });
            }
        }
        catch (error) {
            return res.status(400).json({ "error": "Could not get blog post" });
        }

    }

    else {
        return res.status(400).json({ "error": "Method not allowed" });
    }

}

export function calcUpvoteDifferenceChange(currUpvote, currDownvote, newUpvote, newDownvote) {
    let diff = 0; // diff = upvotes - downvotes (5 - 3 = 2, 4 - 3 = 1, 5 - 2 = 3)

    if (currUpvote) {
        diff = diff - 1; // removing the upvote decreases difference by 1
    }
    else if (currDownvote) {
        diff = diff + 1; // removing the downvote increases difference by 1
    }

    if (newUpvote) {
        diff = diff + 1;
    }
    else if (newDownvote) {
        diff = diff - 1;
    }
    return diff;

}