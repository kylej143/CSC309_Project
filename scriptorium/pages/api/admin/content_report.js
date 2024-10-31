import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/admin/protected';

const prisma = new PrismaClient();

export default async function handler(req, res){
    const adminV = await token_handler(req, res);

    if(adminV){
        // 2. sort
        if(req.method === 'GET'){
            const {corb} = req.query; 

            if(corb === 'comment'){
                const comment = await prisma.comment.findMany({where:{flags:{gt: 0}}, include:{blog: true, user: true}, orderBy:{flags: 'desc'}});
                return res.status(201).json(comment);
            }else if(corb=== 'blog'){
                const blog = await prisma.blog.findMany({where:{flags:{gt: 0}}, include:{user: true}, orderBy:{flags: 'desc'}});
                return res.status(201).json(blog);
            }else{
                return res.status(503).json({error:'error'});
            }
        
        // 3. hide
        }else if(req.method === 'PATCH'){
            const {id, corb} = req.body;  

            if(corb === 'comment'){
                const c = parseInt(id);

                await prisma.comment.update({where: {id: c}, data: {hide: true}});
                return res.status(200).json({message:"hide successfully"});
            }else if(corb === 'blog'){
                const b = parseInt(id);

                await prisma.blog.update({where: {id: b}, data: {hide: true}});
                return res.status(200).json({message:"hide successfully"});
            } else {
                return res.status(503).json({error:'error'});
            }
        }
    }else{
        return res.status(403).json({error: "403 Forbidden"});
    }
}

