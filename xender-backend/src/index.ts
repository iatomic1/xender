import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";
import { desc, or, sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { userTable, tipTable } from "./db/schema";
import { serve } from "bun";

// Initialize core services
const allowedOrigins = ["*"];
const app = new Hono();
app.use(logger());
// app.use(
//   cors({
//     origin: allowedOrigins,
//     allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowHeaders: ["Content-Type", "Authorization"],
//     exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
//     credentials: true,
//   }),
// );
app.options("*", (c) => {
  return c.json({}, 200);
});
export const tipSchema = z.object({
  from: z.string().min(1, { message: "Sender username is required" }), // Sender's xUsername
  to: z.string().min(1, { message: "Receiver username is required" }), // Receiver's xUsername
  amount: z.number().positive({ message: "Tip amount must be greater than 0" }), // Tip amount in dollars
  currency: z.enum(["STX", "MEME", "VELAR"], {
    // Allowed currencies
    message: "Currency must be one of STX, MEME, or VELAR",
  }),
  senderStxAddress: z
    .string()
    .min(1, { message: "Sender STX address is required" }), // Sender's STX address
  receiverStxAddress: z
    .string()
    .min(1, { message: "Receiver STX address is required" }), // Receiver's STX address
});

app.post("/tips", async (c) => {
  try {
    const body = await c.req.json();

    // Validate and parse the request body
    const tipData = tipSchema.parse({
      ...body,
      amount: parseFloat(body.amount), // Ensure amount is parsed as a float
    });

    if (tipData.amount <= 0 || !isFinite(tipData.amount)) {
      return c.json(
        {
          success: false,
          error: "Tip amount must be greater than 0 and be a valid number",
          receivedAmount: tipData.amount,
        },
        400,
      );
    }

    const result = await db.transaction(async (tx) => {
      const [fromUser, toUser] = await Promise.all([
        tx
          .insert(userTable)
          .values({
            xUsername: tipData.from,
            stxAddress: tipData.senderStxAddress,
          })
          .onConflictDoUpdate({
            target: userTable.xUsername,
            set: { stxAddress: tipData.senderStxAddress },
          })
          .returning(),

        tx
          .insert(userTable)
          .values({
            xUsername: tipData.to,
            stxAddress: tipData.receiverStxAddress,
          })
          .onConflictDoUpdate({
            target: userTable.xUsername,
            set: { stxAddress: tipData.receiverStxAddress },
          })
          .returning(),
      ]);

      const [tip] = await tx
        .insert(tipTable)
        .values({
          fromUserId: fromUser[0].id,
          toUserId: toUser[0].id,
          amount: tipData.amount, // Floating-point amount
          currency: tipData.currency,
        })
        .returning();

      await tx
        .update(userTable)
        .set({ totalSent: sql`${userTable.totalSent} + ${tipData.amount}` })
        .where(eq(userTable.id, fromUser[0].id));

      await tx
        .update(userTable)
        .set({
          totalReceived: sql`${userTable.totalReceived} + ${tipData.amount}`,
        })
        .where(eq(userTable.id, toUser[0].id));

      return { tip, fromUser: fromUser[0], toUser: toUser[0] };
    });

    return c.json({
      success: true,
      tipId: result.tip.id,
      details: {
        from: tipData.from,
        to: tipData.to,
        amount: tipData.amount,
        currency: tipData.currency,
        timestamp: result.tip.createdAt,
      },
    });
  } catch (error) {
    console.error("Error processing tip:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
          receivedPayload: error.input,
        },
        400,
      );
    }

    return c.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      500,
    );
  }
});

app.get("/leaderboard", async (c) => {
  try {
    c.res.headers.append("Access-Control-Allow-Origin", "*");
    c.res.headers.append(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    c.res.headers.append(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    c.res.headers.append("Access-Control-Allow-Credentials", "true");

    const totalReceivedCalc = sql<number>`SUM(CASE WHEN ${tipTable.toUserId} = ${userTable.id} THEN ${tipTable.amount} ELSE 0 END)`;

    const leaderboardData = await db
      .select({
        // User fields
        user: {
          id: userTable.id,
          xUsername: userTable.xUsername,
          stxAddress: userTable.stxAddress,
          totalSent: userTable.totalSent,
          totalReceived: userTable.totalReceived,
          createdAt: userTable.createdAt,
          updatedAt: userTable.updatedAt,
        },
        // Aggregated tip data
        tipStats: {
          currency: tipTable.currency,
          totalSent: sql<number>`SUM(CASE WHEN ${tipTable.fromUserId} = ${userTable.id} THEN ${tipTable.amount} ELSE 0 END)`,
          totalReceived: totalReceivedCalc,
        },
      })
      .from(userTable)
      .leftJoin(
        tipTable,
        or(
          eq(tipTable.fromUserId, userTable.id),
          eq(tipTable.toUserId, userTable.id),
        ),
      )
      .groupBy(
        userTable.id,
        userTable.xUsername,
        userTable.stxAddress,
        userTable.totalSent,
        userTable.totalReceived,
        userTable.createdAt,
        userTable.updatedAt,
        tipTable.currency,
      )
      .orderBy(desc(totalReceivedCalc));

    // Format the leaderboard data
    const leaderboard = leaderboardData.map((entry) => ({
      user: {
        ...entry.user,
        totalSent: Number(entry.user.totalSent),
        totalReceived: Number(entry.user.totalReceived),
      },
      tipStats: {
        currency: entry.tipStats.currency || null,
        totalSent: Number(entry.tipStats.totalSent),
        totalReceived: Number(entry.tipStats.totalReceived || 0),
      },
    }));

    return c.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
      },
      500,
    );
  }
});

serve({
  fetch: app.fetch,
  port: 8787,
});

// export default app;
