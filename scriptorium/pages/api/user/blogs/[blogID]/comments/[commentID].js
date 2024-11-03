import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
import { calcUpvoteDifferenceChange } from '@/pages/api/user/blogs/\[blogID\]/index.js';
const prisma = new PrismaClient();

export default async function handler(req, res) {

    const blogID = Number(req.query.blogID);
    const commentID = Number(req.query.commentID);
    const userV = await token_handler(req, res);
    const ratings = [true, false];

    // UPVOTE/DOWNVOTE COMMENTS
    if (req.method === "PUT" && (ratings.includes(req.body.upvote) || ratings.includes(req.body.downvote))) {

        // Ensure user is logged in
        if (!userV) {
            return res.status(401).json({ error: "Please log in" });
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
            return res.status(404).json({ error: "Cannot find comment" });
        }

        // Ensure comment is not hidden
        const checkHidden = await prisma.comment.findUnique({
            where: {
                id: commentID,
            }
        })

        if (checkHidden.hide === true) {
            return res.status(404).json({ error: "Cannot find comment" });
        }

        // Check valid rating
        const ratings = [true, false]
        if ((req.body.upvote && !ratings.includes(req.body.upvote)) || (req.body.downvote && !ratings.includes(req.body.downvote))) {
            return res.status(403).json({ error: "Invalid rating" });
        }

        const upvote = (req.body.upvote === true);
        const downvote = (req.body.downvote === true);

        // Cannot both upvote and downvote a post
        if (upvote && downvote) {
            return res.status(403).json({ error: "Cannot upvote and downvote same comment" });
        }

        // Update or create rating
        try {

            // check if rating already exists
            const existingRating = await prisma.commentRating.findUnique({
                where: {
                    userID_commentID: {
                        userID: userID,
                        commentID: commentID
                    }
                }
            })

            let upvoteChange = 0;
            let downvoteChange = 0;
            let diffChange = 0;

            if (existingRating) {

                // check that you aren't making the same rating again
                if ((existingRating.upvote === upvote) && (existingRating.downvote === downvote)) {
                    return res.status(403).json({ error: "You have already made this rating" });
                }

                // false, true --> false, false
                // upvotechange = 0 - 0 = 0
                // downvotechange = 0 - 1 = -1         
                upvoteChange = Number(upvote) - Number(existingRating.upvote);
                downvoteChange = Number(downvote) - Number(existingRating.downvote);
                diffChange = calcUpvoteDifferenceChange(existingRating.upvote, existingRating.downvote, upvote, downvote);
            }
            else {

                if ((upvote === false) && (downvote === false)) {
                    return res.status(403).json({ error: "You have already made this rating" });
                }

                upvoteChange = Number(upvote);
                downvoteChange = Number(downvote);
                diffChange = calcUpvoteDifferenceChange(false, false, upvote, downvote);
            }

            // if rating exists, update; if does not exist, make it
            const newRating = await prisma.commentRating.upsert({
                where: {
                    userID_commentID: {
                        userID: userID,
                        commentID: commentID
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
                    comment: {
                        connect: { id: commentID },
                    }
                },
            })

            // update upvotes, downvotes, and difference on associated comment post
            const associatedComment = await prisma.comment.update({
                where: {
                    id: newRating.commentID,
                },
                data: {
                    up: { increment: upvoteChange },
                    down: { increment: downvoteChange },
                    difference: { increment: diffChange }
                }
            })

            // update absolute difference
            const absDifference = Math.abs(associatedComment.difference);
            await prisma.comment.update({
                where: {
                    id: newRating.commentID,
                },
                data: {
                    absDifference: absDifference,
                }
            })


            // If upvote and downvote are both false, then we should delete the rating
            if (newRating.upvote === false && newRating.downvote === false) {
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

            return res.status(201).json(newRating);
        }
        catch (error) {
            return res.status(403).json({ error: "Could not make rating" })
        }

    }

    else {
        return res.status(403).json({ error: "Method not allowed" });
    }

}