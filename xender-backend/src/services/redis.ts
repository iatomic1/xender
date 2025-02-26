import { Redis } from "ioredis";

export const redisClient = new Redis();
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();
