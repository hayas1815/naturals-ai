const supabase = require('../config/supabase');
const logger = require('../utils/logger');

// In-memory store for suspicious activity tracking (replace with Redis in prod)
const suspiciousIpMap = new Map();

const SUSPICIOUS_THRESHOLD = 5; // failed attempts before flagging
const BLOCK_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Logs all authenticated API requests to the audit log in Supabase.
 * Attach this AFTER the authenticate middleware.
 * Usage: router.use(authenticate, auditLog)
 */
const auditLog = async (req, res, next) => {
    // Only log mutating or sensitive operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const userId = req.user?.id || null;
        const entry = {
            user_id: userId,
            action: `${req.method} ${req.baseUrl}${req.path}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            metadata: {
                query: req.query,
                // Never log raw body — only keys to avoid logging sensitive data
                bodyKeys: req.body ? Object.keys(req.body) : [],
            },
        };
        // Fire-and-forget: don't block request on log write
        supabase.from('audit_logs').insert(entry).then(({ error }) => {
            if (error) logger.warn('Audit log write failed', { error: error.message });
        });
    }
    next();
};

/**
 * Detects and blocks IPs with repeated failed auth/validation attempts.
 * Call this before route handlers on sensitive endpoints.
 */
const suspiciousActivityDetector = (req, res, next) => {
    const ip = req.ip;
    const record = suspiciousIpMap.get(ip);
    const now = Date.now();

    if (record) {
        // Reset if window has expired
        if (now - record.firstAttempt > BLOCK_WINDOW_MS) {
            suspiciousIpMap.delete(ip);
        } else if (record.count >= SUSPICIOUS_THRESHOLD) {
            logger.warn(`Blocked suspicious IP: ${ip} (${record.count} failures in window)`);
            return res.status(429).json({
                success: false,
                message: 'Access temporarily suspended. Too many failed attempts.',
            });
        }
    }
    next();
};

/**
 * Records a failed attempt for an IP. Call this in auth error handlers.
 */
const recordFailedAttempt = (ip) => {
    const now = Date.now();
    const record = suspiciousIpMap.get(ip);
    if (!record || now - record.firstAttempt > BLOCK_WINDOW_MS) {
        suspiciousIpMap.set(ip, { count: 1, firstAttempt: now });
    } else {
        record.count += 1;
        if (record.count >= SUSPICIOUS_THRESHOLD) {
            logger.warn(`Suspicious activity threshold reached for IP: ${ip}`);
        }
    }
};

module.exports = { auditLog, suspiciousActivityDetector, recordFailedAttempt };
