import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected';

const prisma = new PrismaClient();

export default async function handler(req, res){
    const userV = await token_handler(req, res);

    // 1. report comment
    if(req.method === 'POST'){
        if(userV){
            try{
                const userID = userV.id;
                const {commentID, reason} = req.body;
                
                if(!commentID){
                    return res.status(400).json({error:'no comment id'});
                }else{
                    const cid = parseInt(commentID, 10);
                    const check_comment = await prisma.comment.findUnique({where: { id: cid}});

                    if(!check_comment){
                        return res.status(400).json({error:'comment does not exist'});
                    }

                    const reported = await prisma.commentReport.findUnique({where: {cc: {userID: userID,commentID: cid}}});

                    if(reported){
                        return res.status(400).json({error:'already reported'});
                    }

                    await prisma.commentReport.create({data: {userID: userID, commentID: cid, reason: reason}});
                    await prisma.comment.update({where: {id: cid}, data: {flags: {increment: 1}}});
                    res.status(200).json({reason:reason});
                }
            }catch(error){
                return res.status(503).json({error:'error'});
            }
        }else{
            return res.status(403).json({error: "403 Forbidden"});
        }
    }
}