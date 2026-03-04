import "dotenv/config";
import { defineConfig } from "prisma/config";

// Diese Konfiguration wird NUR für den lokalen 'db:push' verwendet.
export default defineConfig({
  // WICHTIG: Sie verweist auf ein anderes Schema!
  schema: "prisma/dev.schema.prisma", 
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
