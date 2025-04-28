import { sql } from "drizzle-orm";
import { integer, varchar, pgTable, serial, text } from "drizzle-orm/pg-core";

// users schema
export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").notNull(),
  age: integer("age").notNull(),
  bloodGroup: varchar("blood_group").notNull(),
  createdBy: varchar("created_by").notNull(),
});

// records schema
export const Records = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id)
    .notNull(),
  recordName: varchar("report_name").notNull(),
  status: varchar("status").notNull(),
  details: text("details").notNull(),// "normal", "abnormal", "critical"
  analysisResult: varchar("analysis_result").notNull(), // full analysis report text (optional large field)
  reportDate: varchar("report_date").notNull(), // (optional) date of the report
  createdBy: varchar("created_by").notNull(),
});
