export function getClientIp(headers: Headers) {
    const cloudflareIp = headers.get("cf-connecting-ip");
    if (cloudflareIp) return cloudflareIp.trim();

    const realIp = headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    const forwardedFor = headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();

    return "unknown";
}
