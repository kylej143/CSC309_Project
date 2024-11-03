import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected';

const prisma = new PrismaClient();

export default async function handler(req, res){
    const userV = await token_handler(req, res);

    // 1. report blog
    if(req.method === 'POST'){
        if(userV){
            try{
                const userID = userV.id;
                const {blogID, reason} = req.body;
                
                const bid = parseInt(blogID, 10);
                const check_blog = await prisma.blog.findUnique({where: { id: bid}});

                if(!check_blog){
                    return res.status(403).json({error:'Blog does not exist.'});
                }else{
                    const reported = await prisma.blogReport.findUnique({where: {bb: {userID: userID,blogID: bid}}});

                    if(reported){
                        return res.status(403).json({error:'You already reported this blog.'});
                    }

                    await prisma.blogReport.create({data: {userID: userID, blogID: bid, reason: reason}});
                    await prisma.blog.update({where: {id: bid}, data: {flags: {increment: 1}}});
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
