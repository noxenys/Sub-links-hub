import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getAllCategories, getAllLinks, getLinksByCategory, createLink, updateLink, deleteLink, createCategory } from "./db";
import {
  createNotification,
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  deleteNotification,
  // getStripeProducts,
  // getUserSubscriptions,
  // getUserTransactions,
} from "./db-notifications";
// Stripe imports temporarily disabled
// import { createCheckoutSession, createSubscriptionCheckoutSession } from "./stripe-service";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  subscriptions: router({
    categories: publicProcedure.query(async () => {
      return await getAllCategories();
    }),

    links: publicProcedure.query(async () => {
      return await getAllLinks();
    }),

    linksByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await getLinksByCategory(input.categoryId);
      }),

    createLink: publicProcedure
      .input(z.object({
        categoryId: z.number(),
        title: z.string(),
        description: z.string(),
        url: z.string(),
        protocol: z.string(),
        stability: z.enum(["high", "medium", "low"]),
        tags: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        try {
          const tagsJson = JSON.stringify(input.tags);
          const result = await createLink({
            categoryId: input.categoryId,
            title: input.title,
            description: input.description,
            url: input.url,
            protocol: input.protocol,
            stability: input.stability,
            tags: tagsJson,
            isActive: 1,
          });
          return { success: true, result };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create link",
          });
        }
      }),

    updateLink: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
        protocol: z.string().optional(),
        stability: z.enum(["high", "medium", "low"]).optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const updateData: any = {};
          if (input.title) updateData.title = input.title;
          if (input.description) updateData.description = input.description;
          if (input.url) updateData.url = input.url;
          if (input.protocol) updateData.protocol = input.protocol;
          if (input.stability) updateData.stability = input.stability;
          if (input.tags) updateData.tags = JSON.stringify(input.tags);
          updateData.updatedAt = new Date();

          const result = await updateLink(input.id, updateData);
          return { success: true, result };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update link",
          });
        }
      }),

    deleteLink: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const result = await deleteLink(input.id);
          return { success: true, result };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete link",
          });
        }
      }),
  }),

  notifications: router({
    getAll: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.openId;
        if (!userId) return [];
        return await getNotifications(userId, input?.limit || 20);
      }),

    getUnread: publicProcedure
      .query(async ({ ctx }) => {
        const userId = ctx.user?.openId;
        if (!userId) return [];
        return await getUnreadNotifications(userId);
      }),

    markAsRead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.openId;
        if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
        await markNotificationAsRead(input.id);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.openId;
        if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
        await deleteNotification(input.id);
        return { success: true };
      }),
  }),

  // Stripe payment routes temporarily disabled - will be enabled when Stripe account is set up
  // payments: router({ ... }),
});

export type AppRouter = typeof appRouter;
