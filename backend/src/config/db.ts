import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
