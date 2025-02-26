// import { Hono } from "hono";
// import { logger } from "hono/logger";
// import { cors } from "hono/cors";
// import { z } from "zod";
// import { sql } from "bun";
// import { eq } from "drizzle-orm";
// import { db } from "./db";
// import { userTable, tipTable } from "./db/schema";
//
// // Initialize core services
// const allowedOrigins = [
//   "https://x.com",
//   "https://stx.city",
//   "http://localhost:3000",
//   "http://localhost:5173",
// ];
// console.log(1);
// const app = new Hono();
// console.log(2);
// app.use(logger());
// app.use(
//   cors({
//     origin: allowedOrigins,
//   }),
// );
//
// console.log(3);
// export const tipSchema = z.object({
//   from: z.string().min(1, { message: "Sender username is required" }), // Sender's xUsername
//   to: z.string().min(1, { message: "Receiver username is required" }), // Receiver's xUsername
//   amount: z.number().positive({ message: "Tip amount must be greater than 0" }), // Tip amount in dollars
//   currency: z.enum(["STX", "MEME", "VELAR"], {
//     // Allowed currencies
//     message: "Currency must be one of STX, MEME, or VELAR",
//   }),
//   senderStxAddress: z
//     .string()
//     .min(1, { message: "Sender STX address is required" }), // Sender's STX address
//   receiverStxAddress: z
//     .string()
//     .min(1, { message: "Receiver STX address is required" }), // Receiver's STX address
// });
// console.log(4);
//
// app.post("/tips", async (c) => {
//   try {
//     const body = await c.req.json();
//
//     // Validate and parse the request body
//     const tipData = tipSchema.parse({
//       ...body,
//       amount: Number(body.amount),
//     });
//
//     if (tipData.amount <= 0 || !isFinite(tipData.amount)) {
//       return c.json(
//         {
//           success: false,
//           error: "Tip amount must be greater than 0 and be a valid number",
//           receivedAmount: tipData.amount,
//         },
//         400,
//       );
//     }
//
//     const result = await db.transaction(async (tx) => {
//       const [fromUser, toUser] = await Promise.all([
//         tx
//           .insert(userTable)
//           .values({
//             xUsername: tipData.from,
//             stxAddress: tipData.senderStxAddress,
//           })
//           .onConflictDoUpdate({
//             target: userTable.xUsername,
//             set: { stxAddress: tipData.senderStxAddress },
//           })
//           .returning(),
//
//         tx
//           .insert(userTable)
//           .values({
//             xUsername: tipData.to,
//             stxAddress: tipData.receiverStxAddress,
//           })
//           .onConflictDoUpdate({
//             target: userTable.xUsername,
//             set: { stxAddress: tipData.receiverStxAddress },
//           })
//           .returning(),
//       ]);
//
//       const [tip] = await tx
//         .insert(tipTable)
//         .values({
//           fromUserId: fromUser[0].id,
//           toUserId: toUser[0].id,
//           amount: amountInCents,
//           currency: tipData.currency, // e.g., "STX", "MEME", "VELAR"
//         })
//         .returning();
//
//       // Update user statistics
//       await tx
//         .update(userTable)
//         .set({ tipsSent: sql`${userTable.tipsSent} + ${amountInCents}` })
//         .where(eq(userTable.id, fromUser[0].id));
//
//       await tx
//         .update(userTable)
//         .set({
//           tipsReceived: sql`${userTable.tipsReceived} + ${amountInCents}`,
//         })
//         .where(eq(userTable.id, toUser[0].id));
//
//       return { tip, fromUser: fromUser[0], toUser: toUser[0] };
//     });
//
//     return c.json({
//       success: true,
//       tipId: result.tip.id,
//       details: {
//         from: tipData.from,
//         to: tipData.to,
//         amount: tipData.amount,
//         currency: tipData.currency,
//         timestamp: result.tip.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Error processing tip:", error);
//
//     if (error instanceof z.ZodError) {
//       return c.json(
//         {
//           success: false,
//           error: "Validation failed",
//           details: error.errors.map((err) => ({
//             field: err.path.join("."),
//             message: err.message,
//             code: err.code,
//           })),
//           receivedPayload: error.input,
//         },
//         400,
//       );
//     }
//
//     return c.json(
//       {
//         success: false,
//         error: "Internal server error",
//         message: error.message,
//         stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
//       },
//       500,
//     );
//   }
// });
//
// console.log(5);
// export default app;
