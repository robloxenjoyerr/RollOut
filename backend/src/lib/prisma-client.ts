import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

import { Pool } from "pg";
import Database from "better-sqlite3";

import 'dotenv/config';

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL!
// })

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
// const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// export default prisma


// ------------------------
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in the environment variables.");
  }

  if (process.env.NODE_ENV === 'development') {
    console.log("✅ [Prisma] Development mode: Initializing SQLite adapter...");

    // =======================================================================
    // HIER IST DIE FINALE KORREKTUR
    // Wir übergeben dem Adapter nicht mehr die `new Database(...)`-Instanz,
    // sondern ein Konfigurationsobjekt, das den Dateipfad enthält.
    // =======================================================================
    const adapter = new PrismaBetterSqlite3({
      url: databaseUrl, // databaseUrl ist hier "file:./prisma/dev.db"
    });
    
    return new PrismaClient({ adapter });

  } else {
    // PRODUKTION (Dieser Teil war schon korrekt)
    console.log("🚀 [Prisma] Production mode: Initializing PostgreSQL adapter...");
    
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    
    return new PrismaClient({ adapter });
  }
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;