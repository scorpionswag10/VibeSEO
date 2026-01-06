import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Projects (Websites to track)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Keywords to track for a project
export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  term: text("term").notNull(),
  location: text("location").default("United States"),
  lastCheck: timestamp("last_check"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Rank History (Time series data for rankings)
export const rankHistory = pgTable("rank_history", {
  id: serial("id").primaryKey(),
  keywordId: integer("keyword_id").notNull(),
  googleRank: integer("google_rank"),
  bingRank: integer("bing_rank"),
  ddgRank: integer("ddg_rank"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

// Competitors
export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  domain: text("domain").notNull(),
  backlinksCount: integer("backlinks_count").default(0),
  topBacklinks: jsonb("top_backlinks").$type<string[]>(), // Store URLs of top backlinks
  lastCheck: timestamp("last_check"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings (For API keys check status - keys stored in env vars, this tracks user prefs)
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  emailNotifications: boolean("email_notifications").default(true),
  notificationEmail: text("notification_email"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity Logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  keywords: many(keywords),
  competitors: many(competitors),
}));

export const keywordsRelations = relations(keywords, ({ one, many }) => ({
  project: one(projects, {
    fields: [keywords.projectId],
    references: [projects.id],
  }),
  history: many(rankHistory),
}));

export const rankHistoryRelations = relations(rankHistory, ({ one }) => ({
  keyword: one(keywords, {
    fields: [rankHistory.keywordId],
    references: [keywords.id],
  }),
}));

export const competitorsRelations = relations(competitors, ({ one }) => ({
  project: one(projects, {
    fields: [competitors.projectId],
    references: [projects.id],
  }),
}));

// Activity Logs Relations (None needed for now)

// Schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertKeywordSchema = createInsertSchema(keywords).omit({ id: true, lastCheck: true, createdAt: true });
export const insertCompetitorSchema = createInsertSchema(competitors).omit({ id: true, backlinksCount: true, topBacklinks: true, lastCheck: true, createdAt: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, timestamp: true });

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Keyword = typeof keywords.$inferSelect;
export type InsertKeyword = z.infer<typeof insertKeywordSchema>;
export type RankHistory = typeof rankHistory.$inferSelect;
export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
