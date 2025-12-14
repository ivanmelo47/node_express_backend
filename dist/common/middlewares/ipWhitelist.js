"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipWhitelist = void 0;
// Define allowed IPs. In a real app, these might come from specific ENV vars (e.g., WHITELISTED_IPS=127.0.0.1,::1)
const allowedIps = ["::1", "127.0.0.1"];
const ipWhitelist = (req, res, next) => {
    // Get client IP. Trust proxy is set in app.ts, so req.ip should be correct if behind proxy.
    let clientIp = req.ip || req.connection.remoteAddress;
    // Normalization for localhost (ipv6 to ipv4 mapping sometimes happens)
    if (clientIp === "::ffff:127.0.0.1") {
        clientIp = "127.0.0.1";
    }
    // Allow if IP is in the list
    if (allowedIps.includes(clientIp)) {
        return next();
    }
    // Deny access
    console.warn(`[Security] Blocked request from unauthorized IP: ${clientIp}`);
    return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized IP address",
    });
};
exports.ipWhitelist = ipWhitelist;
