import { defineConfig } from "drizzle-kit";
import Config from "./src/config";

export default defineConfig({
    dialect: "mysql",
    schema: "./src/utils/db/schema.ts",
    out: "./src/utils/db/drizzle",
    dbCredentials: {
        url: Config.DATABASE_URL,
    }
});
