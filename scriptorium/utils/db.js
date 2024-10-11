import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// call with: import prisma from "@/utils/db"
export default prisma;
