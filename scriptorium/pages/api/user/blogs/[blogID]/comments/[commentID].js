import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
const prisma = new PrismaClient();

export default async function handler(req, res) {

    const blogID = Number(req.query.blogID);
    const commentID = Number(req.query.commentID);
    const userV = await token_handler(req, res);

    // UPVOTE/DOWNVOTE COMMENTS
    if (req.method === "PUT" && (req.body.upvote || req.body.downvote)) {

        // Ensure user is logged in
        if (!userV) {
            return res.status(400).json({ "error": "Please log in" });
        }

        const userID = Number(userV.id);

        // Check blog associated with comment
        let blogPost = await prisma.blog.findUnique({
            where: {
                id: blogID,
                comments: {
                    some: { id: commentID }
                }
            }
        });

        if (!blogPost) {
            return res.status(400).json({ "error": "Cannot find comment" });
        }

        // Check valid rating
        const ratings = [true, false]
        if ((req.body.upvote && !ratings.includes(req.body.upvote)) || (req.body.downvote && !ratings.includes(req.body.downvote))) {
            return res.status(400).json({ "message": "Invalid rating" });
        }

        const upvote = (req.body.upvote === true);
        const downvote = (req.body.downvote === true);

        // Cannot both upvote and downvote a post
        if (upvote && downvote) {
            return res.status(200).json({ "message": "Cannot upvote and downvote same comment" });
        }

        // Update or create rating
        try {
            // 1) if the rating already exists, set everything to false - this 
            // ensures that the new rating does not "combine" with the old rating
            // to create a true-true situation. if the rating does not exist, make it.
            await prisma.commentRating.upsert({
                where: {
                    userID_commentID: {
                        userID: userID,
                        commentID: commentID
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
                    comment: {
                        connect: { id: commentID },
                    }
                },
            })

            // 2) make the rating
            const rating = await prisma.commentRating.update({
                where: {
                    userID_commentID: {
                        userID: userID,
                        commentID: commentID
                    }
                },
                data: {
                    upvote: upvote,
                    downvote: downvote
                }
            })

            // If upvote and downvote are both false, then we should delete the rating
            if (rating.upvote === false && rating.downvote === false) {
                await prisma.commentRating.delete({
                    where: {
                        userID_commentID: {
                            userID: userID,
                            commentID: commentID
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

    else {
        return res.status(200).json({ "message": "Method not allowed" });
    }

}