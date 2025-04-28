import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
const sql = neon(
  "postgresql://neondb_owner:npg_doDcOB2J9uNp@ep-polished-sun-a4i3qo1o-pooler.us-east-1.aws.neon.tech/redcell?sslmode=require"
);
export const db = drizzle(sql, { schema });
