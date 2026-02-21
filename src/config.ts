import { configDotenv } from "dotenv";

configDotenv();

const config = {
    DATABASE_URL: process.env.DATABASE_URL,
    API_ROUTE: process.env.API_ROUTE || "/analytics",
}

export default config