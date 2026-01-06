import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { api } from "@shared/routes";
import { rankHistory } from "@shared/schema";
import { z } from "zod";
import cron from "node-cron";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Mock DataForSEO if keys missing
const MOCK_RANKINGS = true;

import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import OpenAI from "openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  registerChatRoutes(app);
  registerImageRoutes(app);

  // Initialize settings
  await storage.initializeSettings();

  // --- API Routes ---

  // Projects
  app.get(api.projects.list.path, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.post(api.projects.create.path, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.projects.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    // Also fetch keywords and competitors for simple view
    const keywords = await storage.getKeywordsByProject(id);
    const competitors = await storage.getCompetitorsByProject(id);
    
    res.json({ ...project, keywords, competitors });
  });

  app.delete(api.projects.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProject(id);
    res.status(204).send();
  });

  // Keywords
  app.post(api.keywords.create.path, async (req, res) => {
    try {
      const input = api.keywords.create.input.parse(req.body);
      const keyword = await storage.createKeyword(input);
      
      // Trigger an immediate check for this keyword (async)
      checkKeywordRank(keyword.id, input.term).catch(console.error);

      res.status(201).json(keyword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.keywords.listByProject.path, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const keywords = await storage.getKeywordsByProject(projectId);
    res.json(keywords);
  });

  app.delete(api.keywords.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteKeyword(id);
    res.status(204).send();
  });

  // Competitors
  app.post(api.competitors.create.path, async (req, res) => {
    try {
      const input = api.competitors.create.input.parse(req.body);
      const competitor = await storage.createCompetitor(input);
      
      // Trigger immediate backlink check (async)
      checkCompetitorBacklinks(competitor.id, competitor.domain).catch(console.error);

      res.status(201).json(competitor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.competitors.listByProject.path, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const competitors = await storage.getCompetitorsByProject(projectId);
    res.json(competitors);
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const s = await storage.getSettings();
    res.json(s);
  });

  app.patch(api.settings.update.path, async (req, res) => {
    const input = api.settings.update.input.parse(req.body);
    const s = await storage.updateSettings(input);
    res.json(s);
  });

  app.get(api.settings.checkIntegrations.path, async (req, res) => {
    res.json({
      dataForSeo: !!process.env.DATAFORSEO_AUTH,
      email: !!process.env.RESEND_API_KEY,
    });
  });

  app.post(api.settings.testEmail.path, async (req, res) => {
    if (!resend) {
      return res.status(400).json({ message: "Resend API Key is not configured." });
    }

    try {
      const settings = await storage.getSettings();
      const emailTo = settings?.notificationEmail;

      if (!emailTo) {
        return res.status(400).json({ message: "Notification email not set in settings." });
      }

      await resend.emails.send({
        from: 'VibeSEO <onboarding@resend.dev>',
        to: emailTo,
        subject: 'VibeSEO: Test Email',
        text: 'Hello World! This is a test email from your VibeSEO rank tracker.',
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Test email failed:', error);
      res.status(500).json({ message: error.message || "Failed to send test email." });
    }
  });


  app.get(api.settings.competitorResearch.path, async (req, res) => {
    const url = req.params.url;
    
    // Mock Data for now
    const researchData = {
      totalBacklinks: 12500 + Math.floor(Math.random() * 5000),
      referringDomains: 850 + Math.floor(Math.random() * 200),
      domainRating: 65 + Math.floor(Math.random() * 10),
      topReferringDomains: [
        { domain: "techcrunch.com", dr: 92, dateDiscovered: "2023-11-15" },
        { domain: "nytimes.com", dr: 94, dateDiscovered: "2023-12-01" },
        { domain: "medium.com", dr: 88, dateDiscovered: "2024-01-05" },
        { domain: "github.com", dr: 96, dateDiscovered: "2023-10-20" },
        { domain: "forbes.com", dr: 91, dateDiscovered: "2024-01-10" },
      ]
    };

    if (process.env.DATAFORSEO_AUTH) {
      console.log(`Ready to trigger DataForSEO for ${url}`);
      // Actual implementation would go here
    }

    res.json(researchData);
  });

  // Sync All Keywords Now
  app.post("/api/keywords/sync", async (req, res) => {
    try {
      log("Manual sync triggered");
      await storage.addActivityLog({ message: "Started manual sync of all keywords" });
      const keywords = await storage.getAllKeywords();
      
      // Run sync in background so response is fast
      (async () => {
        for (const kw of keywords) {
          await checkKeywordRank(kw.id, kw.term);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        log("Manual sync completed");
        await storage.addActivityLog({ message: `Completed manual sync of ${keywords.length} keywords` });
      })().catch(err => console.error("Manual sync failed:", err));

      res.json({ message: "Sync started in background", count: keywords.length });
    } catch (err) {
      console.error("Manual sync error:", err);
      res.status(500).json({ message: "Failed to start sync" });
    }
  });

  // Get Activity Logs
  app.get(api.settings.getLogs.path, async (req, res) => {
    const logs = await storage.getActivityLogs();
    res.json(logs);
  });

  // Database Stats
  app.get(api.settings.getDbStats.path, async (req, res) => {
    const stats = await storage.getDbStats();
    res.json(stats);
  });

  // Content Ideas (AI)
  app.post(api.settings.generateContentIdeas.path, async (req, res) => {
    try {
      const { keyword } = api.settings.generateContentIdeas.body.parse(req.body);
      
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: "You are an SEO content strategist. Provide output in JSON format."
          },
          {
            role: "user",
            content: `Generate 5 catchy blog post titles and 3 'People Also Ask' questions for the keyword: "${keyword}". Return as JSON with keys 'blogTitles' (array) and 'questions' (array).`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = JSON.parse(response.choices[0].message.content || "{}");
      await storage.addActivityLog({ message: `Generated AI content ideas for: "${keyword}"` });
      res.json(content);
    } catch (err) {
      console.error("AI Generation failed:", err);
      res.status(500).json({ message: "Failed to generate ideas" });
    }
  });

  // Export to CSV
  app.get(api.settings.exportCsv.path, async (req, res) => {
    try {
      const allKeywords = await storage.getAllKeywords();
      const csvRows = [
        ["Keyword", "Location", "Last Checked", "Google Rank", "Bing Rank", "DDG Rank"].join(",")
      ];

      for (const kw of allKeywords) {
        const history = await storage.getRankHistory(kw.id);
        const latest = history[0]; // Assuming sorted by desc
        csvRows.push([
          `"${kw.term}"`,
          `"${kw.location}"`,
          kw.lastCheck ? kw.lastCheck.toISOString() : "N/A",
          latest?.googleRank || "N/A",
          latest?.bingRank || "N/A",
          latest?.ddgRank || "N/A"
        ].join(","));
      }

      await storage.addActivityLog({ message: "Exported keyword ranking data to CSV" });
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=rankings.csv");
      res.send(csvRows.join("\n"));
    } catch (err) {
      console.error("Export failed:", err);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Weekly PDF Report (Mock Email for now)
  app.post(api.settings.sendWeeklyReport.path, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const emailTo = settings?.notificationEmail;

      if (!emailTo) {
        return res.status(400).json({ message: "Notification email not set." });
      }

      await storage.addActivityLog({ message: "Generated weekly ranking report" });

      if (resend) {
        await resend.emails.send({
          from: 'VibeSEO <onboarding@resend.dev>',
          to: emailTo,
          subject: 'VibeSEO: Your Weekly Ranking Report',
          text: 'Attached is your weekly ranking report. (PDF Generation would happen here in a full implementation)',
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Report failed:", err);
      res.status(500).json({ message: "Failed to send report" });
    }
  });

  // --- Background Tasks ---

  // Schedule Cron Job: Every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily rank check...');
    await storage.addActivityLog({ message: "Started daily scheduled rank check" });
    const keywords = await storage.getAllKeywords();
    for (const kw of keywords) {
      await checkKeywordRank(kw.id, kw.term);
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('Daily rank check completed.');
    await storage.addActivityLog({ message: `Completed daily scheduled rank check of ${keywords.length} keywords` });
  });

  // Helper: Check Keyword Rank (Mock vs Real)
  async function checkKeywordRank(keywordId: number, term: string) {
    let ranks = { google: 0, bing: 0, ddg: 0 };
    let serpData: any = { google: [], bing: [] };

    if (process.env.DATAFORSEO_AUTH && !MOCK_RANKINGS) {
      // actual implementation...
    } else {
      // Mock Data
      ranks = {
        google: Math.floor(Math.random() * 50) + 1,
        bing: Math.floor(Math.random() * 50) + 1,
        ddg: Math.floor(Math.random() * 50) + 1,
      };

      // Mock SERP Snapshots
      const generateMockSerp = (rank: number) => {
        const results = [];
        for (let i = 1; i <= 10; i++) {
          results.push({
            position: i,
            url: i === rank ? `https://vibeseo.replit.app/page-${i}` : `https://competitor-${i}.com/article`,
            title: i === rank ? `Your Rank #${i} Content` : `Top Competitor Result #${i}`
          });
        }
        return results;
      };
      serpData.google = generateMockSerp(ranks.google);
      serpData.bing = generateMockSerp(ranks.bing);
    }

    await storage.addRankHistory({
      keywordId,
      googleRank: ranks.google,
      bingRank: ranks.bing,
      ddgRank: ranks.ddg,
      serpData,
    });

    await storage.addActivityLog({ message: `Updated ranking for keyword: "${term}"` });

    // Check for alerts (Top 3)
    if (ranks.google <= 3) {
      const settings = await storage.getSettings();
      if (settings?.emailNotifications && settings.notificationEmail) {
        sendAlertEmail(settings.notificationEmail, term, ranks.google);
      }
    }
  }

  // Helper: Check Competitor Backlinks
  async function checkCompetitorBacklinks(competitorId: number, domain: string) {
    // Mock Data for MVP
    const backlinksCount = Math.floor(Math.random() * 10000);
    const topBacklinks = [
      `https://example.com/blog/${domain}`,
      `https://techcrunch.com/${domain}`,
      `https://reddit.com/r/seo/${domain}`,
    ];
    
    await storage.updateCompetitorBacklinks(competitorId, backlinksCount, topBacklinks);
    await storage.addActivityLog({ message: `Updated backlinks for competitor: ${domain}` });
  }

  // Helper: Send Email
  async function sendAlertEmail(to: string, term: string, rank: number) {
    if (!resend) {
      console.log(`[Mock Email] To: ${to}, Subject: Rank Alert! "${term}" is #${rank} on Google`);
      await storage.addActivityLog({ message: `Email notification alert sent to ${to} (Mock)` });
      return;
    }

    try {
      await resend.emails.send({
        from: 'VibeSEO <onboarding@resend.dev>',
        to,
        subject: `VibeSEO Alert: "${term}" reached #${rank} on Google!`,
        text: `Great news! Your keyword "${term}" is now ranking at position ${rank} on Google.`,
      });
      await storage.addActivityLog({ message: `Email notification alert sent to ${to}` });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // --- Seeding ---
  await seedData();

  return httpServer;
}

async function seedData() {
  const projects = await storage.getProjects();
  if (projects.length === 0) {
    console.log("Seeding database...");
    const p = await storage.createProject({
      name: "My Awesome SaaS",
      url: "https://vibeseo.replit.app",
    });

    const k1 = await storage.createKeyword({
      projectId: p.id,
      term: "seo rank tracker",
      location: "United States",
    });

    // Add some history
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
       const date = new Date(today);
       date.setDate(date.getDate() - i);
       // Mock a trend improving over time
       const rank = 50 - Math.floor(i * 1.5) + Math.floor(Math.random() * 5);
       await db.insert(rankHistory).values({
         keywordId: k1.id,
         googleRank: Math.max(1, rank),
         bingRank: Math.max(1, rank + 5),
         ddgRank: Math.max(1, rank + 2),
         checkedAt: date
       });
    }
  }
}
