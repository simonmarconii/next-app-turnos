import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const proxyRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "10 s"),
    ephemeralCache: new Map(),
    prefix: "proxy",
});

export const loginRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    ephemeralCache: new Map(),
    prefix: "login",
});

export const bookingRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    ephemeralCache: new Map(),
    prefix: "booking",
});

export const checkoutRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 m"),
    ephemeralCache: new Map(),
    prefix: "checkout",
});
