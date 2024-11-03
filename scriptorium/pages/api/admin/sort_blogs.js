import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/admin/protected';

const prisma = new PrismaClient();

export default async function handler(req, res){
    const adminV = await token_handler(req, res);

    // 2. sort blogs
    if(req.method === 'GET'){
        if(adminV[0]){
            try{
                const b = await prisma.blog.findMany({orderBy:{flags: 'desc'}});
                
                res.status(200).json({blogs: b.map(bb => ({id: bb.id, title: bb.title, flags: bb.flags}))});
            }catch(error){
                return res.status(503).json({error:'error'});
            }
        }else{
            return res.status(403).json({error: "403 Forbidden"});
        }
    }
}