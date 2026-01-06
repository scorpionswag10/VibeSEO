import { z } from 'zod';
import { insertProjectSchema, insertKeywordSchema, insertCompetitorSchema, insertSettingsSchema, projects, keywords, competitors, rankHistory, settings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema,
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<typeof projects.$inferSelect & { keywords: typeof keywords.$inferSelect[], competitors: typeof competitors.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/projects/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  keywords: {
    create: {
      method: 'POST' as const,
      path: '/api/keywords',
      input: insertKeywordSchema,
      responses: {
        201: z.custom<typeof keywords.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listByProject: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/keywords',
      responses: {
        200: z.array(z.custom<typeof keywords.$inferSelect & { history: typeof rankHistory.$inferSelect[] }>()),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/keywords/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  competitors: {
    create: {
      method: 'POST' as const,
      path: '/api/competitors',
      input: insertCompetitorSchema,
      responses: {
        201: z.custom<typeof competitors.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listByProject: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/competitors',
      responses: {
        200: z.array(z.custom<typeof competitors.$inferSelect>()),
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/settings',
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    checkIntegrations: {
      method: 'GET' as const,
      path: '/api/settings/integrations',
      responses: {
        200: z.object({
          dataForSeo: z.boolean(),
          email: z.boolean(),
        }),
      },
    },
    testEmail: {
      method: 'POST' as const,
      path: '/api/test-email',
      responses: {
        200: z.object({ success: z.boolean() }),
        400: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
    },
    competitorResearch: {
      method: 'GET' as const,
      path: '/api/competitor-research/:url',
      responses: {
        200: z.object({
          totalBacklinks: z.number(),
          referringDomains: z.number(),
          domainRating: z.number(),
          topReferringDomains: z.array(z.object({
            domain: z.string(),
            dr: z.number(),
            dateDiscovered: z.string(),
          })),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
