import { createHash, randomBytes } from "node:crypto";

const ACCESS_TOKEN_DAYS = 30;

export function createScheduleAccessToken() {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashScheduleAccessToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ACCESS_TOKEN_DAYS);

    return { token, tokenHash, expiresAt };
}

export function hashScheduleAccessToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}
