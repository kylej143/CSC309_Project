import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth'; 

const prisma = new PrismaClient();

export default async function handler(req, res){
    const token = req.headers.authorization;
    const userV = verifyToken(token);  

    // 1. save
    if(req.method === 'POST'){
        if(userV){
            const {title, explanation, code, Tag} = req.body;

            try{
                const code_template1 = await prisma.codeTemplate.create({
                    data:{title, explanation, code, user: {connect:{id: userV.id}}, Tag:{
                        connectOrCreate: Tag.map((t) => ({where: {tag: t}, create: {tag: t}}))}   //connectOrCreate cite online source
                    },
                });
                return res.status(201).json(code_template1);
            }catch(error){
                return res.status(500).json({error:'error'});
            }
        }else{
            return res.status(401).json({error:'the user has invalid token'});
        }
    }

    // 2. view, search
    if(req.method === 'GET'){
        if(userV){
            const {title, Tag} = req.query;
      
            try{
                const code_template2 = await prisma.codeTemplate.findMany({where:
                    {
                        userId: userV.id,  
                        title: title ? {contains: title, mode: 'insensitive'}: undefined,  
                        Tag: Tag ? {some:{tag: {in: Tag.split(',')}}}: undefined
                    },include: {user: true, Tag: true}});
                    return res.status(200).json(code_template2);
            }catch(error){
                return res.status(500).json({error:'error'});
            }
        }else{
            return res.status(401).json({error:'the user has invalid token'});
        }
    }

    // 3. edit, delete
    if(req.method === 'PUT'){
        const {id} = req.query;
    
        if(userV){
            const {title, explanation, code, Tag} = req.body;
    
            try{
                const code_template3 = await prisma.codeTemplate.update({
                    where: {id: parseInt(id)}, 
                    data: {title, explanation, code, Tag:{set: [], 
                        connectOrCreate: Tag.map((t) => ({where: {tag: t}, create: {tag: t}}))} //connectOrCreate cite online source
                    },
                });
                return res.status(200).json(code_template3);
            }catch(error){
                return res.status(500).json({error:'error'});
            }
        }else{
            return res.status(401).json({error:'the user has invalid token'});
        }
    }else if(req.method === 'DELETE'){
        const {id} = req.query;

        if(userV){
            await prisma.codeTemplate.delete({where:{id: parseInt(id)}});
            return res.status(204).end();
        }else{
            return res.status(401).json({error:'the user has invalid token'});
        }
    } 
}