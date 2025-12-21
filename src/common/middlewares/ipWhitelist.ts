import { Request, Response, NextFunction } from "express";

// Define allowed IPs.
// If WHITELISTED_IPS is set in env, use it (comma separated).
// If WHITELISTED_IPS is '*', allow all.
// Default to localhost if not set.
const getAllowedIps = (): string[] | string => {
  const envIps = process.env.WHITELISTED_IPS;
  if (envIps === "*") return "*";
  if (envIps) {
    return envIps.split(",").map((ip) => ip.trim());
  }
  return ["::1", "127.0.0.1"];
};

export const ipWhitelist = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get client IP. Trust proxy is set in app.ts, so req.ip should be correct if behind proxy.
  let clientIp = req.ip || req.connection.remoteAddress;

  // Normalization for localhost (ipv6 to ipv4 mapping sometimes happens)
  if (clientIp === "::ffff:127.0.0.1") {
    clientIp = "127.0.0.1";
  }

  const allowedIps = getAllowedIps();

  // Allow if wildcard or IP is in the list
  if (allowedIps === "*" || (Array.isArray(allowedIps) && allowedIps.includes(clientIp as string))) {
    return next();
  }

  // Deny access
  console.warn(`[Security] Blocked request from unauthorized IP: ${clientIp}`);
  return res.status(403).json({
    success: false,
    message: "Access denied: Unauthorized IP address",
  });
};
