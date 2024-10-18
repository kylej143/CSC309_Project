import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const userV = token_handler(req, res);

    // 1. report
    if(req.method === 'POST'){
        if(userV){
            const {reason, blogID, commentID} = req.body;

            try{
                const content_report1 = {reason, userID: userV.id};
                
                if(blogID){
                    content_report1.blogID = parseInt(blogID);  
                }
                if(commentID){
                    content_report1.commentID = parseInt(commentID); 
                }
                
                const content_report2 = await prisma.contentReport.create({data: content_report1});
    
                if(commentID){
                    await prisma.comment.update({where: {id: parseInt(commentID)}, data:{flags:{increment: 1}}});
                }else if(blogID){
                    await prisma.blog.update({where:{id: parseInt(blogID)}, data:{flags:{increment: 1}}});
                }
                return res.status(201).json({content_report2});
            }catch (error){
                return res.status(503).json({error:'error'});
            }
        }else{
            return res.status(403).json({error: "403 Forbidden"});
        }
    }
}