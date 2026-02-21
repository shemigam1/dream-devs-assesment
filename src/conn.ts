import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "./generated/prisma/client";
import config from "./config";
import pg from 'pg';

const pool = new pg.Pool({ connectionString: config.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export { prisma }