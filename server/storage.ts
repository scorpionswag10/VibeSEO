import { db } from "./db";
import {
  projects, keywords, rankHistory, competitors, settings, activityLogs,
  type InsertProject, type InsertKeyword, type InsertCompetitor, type InsertSettings, type InsertActivityLog,
  type Project, type Keyword, type RankHistory, type Competitor, type Settings, type ActivityLog
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Keywords
  getKeywordsByProject(projectId: number): Promise<(Keyword & { history: RankHistory[] })[]>;
  getAllKeywords(): Promise<Keyword[]>; // For cron job
  createKeyword(keyword: InsertKeyword): Promise<Keyword>;
  deleteKeyword(id: number): Promise<void>;
  
  // Rank History
  addRankHistory(history: Omit<RankHistory, "id" | "checkedAt">): Promise<RankHistory>;
  getRankHistory(keywordId: number): Promise<RankHistory[]>;

  // Competitors
  getCompetitorsByProject(projectId: number): Promise<Competitor[]>;
  createCompetitor(competitor: InsertCompetitor): Promise<Competitor>;
  updateCompetitorBacklinks(id: number, count: number, topBacklinks: string[]): Promise<Competitor>;

  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
  initializeSettings(): Promise<Settings>;

  // Activity Logs
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  addActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getKeywordsByProject(projectId: number): Promise<(Keyword & { history: RankHistory[] })[]> {
    const projectKeywords = await db.select().from(keywords).where(eq(keywords.projectId, projectId));
    
    // Fetch history for each keyword (could be optimized with a join/reduce but acceptable for now)
    const results = await Promise.all(projectKeywords.map(async (kw) => {
      const history = await db.select().from(rankHistory)
        .where(eq(rankHistory.keywordId, kw.id))
        .orderBy(desc(rankHistory.checkedAt))
        .limit(30); // Last 30 checks
      return { ...kw, history: history.reverse() }; // Chronological for charts
    }));

    return results;
  }

  async getAllKeywords(): Promise<Keyword[]> {
    return await db.select().from(keywords);
  }

  async createKeyword(keyword: InsertKeyword): Promise<Keyword> {
    const [newKeyword] = await db.insert(keywords).values(keyword).returning();
    return newKeyword;
  }

  async deleteKeyword(id: number): Promise<void> {
    await db.delete(keywords).where(eq(keywords.id, id));
  }

  async addRankHistory(history: Omit<RankHistory, "id" | "checkedAt">): Promise<RankHistory> {
    const [entry] = await db.insert(rankHistory).values(history).returning();
    // Update lastCheck on keyword
    await db.update(keywords)
      .set({ lastCheck: new Date() })
      .where(eq(keywords.id, history.keywordId));
    return entry;
  }

  async getRankHistory(keywordId: number): Promise<RankHistory[]> {
    return await db.select().from(rankHistory)
      .where(eq(rankHistory.keywordId, keywordId))
      .orderBy(desc(rankHistory.checkedAt));
  }

  async getCompetitorsByProject(projectId: number): Promise<Competitor[]> {
    return await db.select().from(competitors).where(eq(competitors.projectId, projectId));
  }

  async createCompetitor(competitor: InsertCompetitor): Promise<Competitor> {
    const [newCompetitor] = await db.insert(competitors).values(competitor).returning();
    return newCompetitor;
  }

  async updateCompetitorBacklinks(id: number, count: number, topBacklinks: string[]): Promise<Competitor> {
    const [updated] = await db.update(competitors)
      .set({ backlinksCount: count, topBacklinks: topBacklinks, lastCheck: new Date() })
      .where(eq(competitors.id, id))
      .returning();
    return updated;
  }

  async getSettings(): Promise<Settings | undefined> {
    const [s] = await db.select().from(settings).limit(1);
    return s;
  }

  async initializeSettings(): Promise<Settings> {
    const existing = await this.getSettings();
    if (existing) return existing;
    const [s] = await db.insert(settings).values({}).returning();
    return s;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const existing = await this.getSettings();
    if (!existing) {
      return this.initializeSettings();
    }
    const [updated] = await db.update(settings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(settings.id, existing.id))
      .returning();
    return updated;
  }

  async getActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp)).limit(limit);
  }

  async addActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
