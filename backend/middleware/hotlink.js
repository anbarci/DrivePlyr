/**
 * Hotlink Protection Middleware
 * Prevents unauthorized domains from embedding videos
 */

exports.checkHotlink = (req, res, next) => {
  // Get referer from request
  const referer = req.get('Referer') || req.get('Origin');
  
  // If no referer, allow (direct access)
  if (!referer) {
    return next();
  }

  try {
    const refererUrl = new URL(referer);
    const refererDomain = refererUrl.hostname;

    // Get allowed domains from env
    const allowedDomains = process.env.ALLOWED_DOMAINS 
      ? process.env.ALLOWED_DOMAINS.split(',').map(d => d.trim())
      : ['localhost', 'anbarci.github.io'];

    // Check if domain is allowed
    const isAllowed = allowedDomains.some(domain => {
      // Exact match
      if (refererDomain === domain) return true;
      
      // Subdomain match (e.g., *.github.io)
      if (domain.startsWith('*.')) {
        const baseDomain = domain.substring(2);
        return refererDomain.endsWith(baseDomain);
      }
      
      return false;
    });

    if (!isAllowed) {
      return res.status(403).json({
        status: 'error',
        message: 'Hotlink koruması: Bu domain\'den erişim izni yok',
        domain: refererDomain
      });
    }

    next();
  } catch (error) {
    // If URL parsing fails, allow the request
    next();
  }
};

// Video-specific hotlink check
exports.checkVideoHotlink = async (req, res, next) => {
  const Video = require('../models/Video');
  
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        status: 'error',
        message: 'Video bulunamadı'
      });
    }

    // If video has custom allowed domains
    if (video.allowedDomains && video.allowedDomains.length > 0) {
      const referer = req.get('Referer') || req.get('Origin');
      
      if (!referer) {
        return next();
      }

      const refererUrl = new URL(referer);
      const refererDomain = refererUrl.hostname;

      const isAllowed = video.allowedDomains.some(domain => {
        if (refererDomain === domain) return true;
        if (domain.startsWith('*.')) {
          const baseDomain = domain.substring(2);
          return refererDomain.endsWith(baseDomain);
        }
        return false;
      });

      if (!isAllowed) {
        return res.status(403).json({
          status: 'error',
          message: 'Bu video için hotlink koruması aktif',
          allowedDomains: video.allowedDomains
        });
      }
    }

    req.video = video;
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Rate limiting per domain
exports.domainRateLimit = () => {
  const domainRequests = new Map();
  const WINDOW_MS = 60000; // 1 minute
  const MAX_REQUESTS = 100; // per domain per minute

  return (req, res, next) => {
    const referer = req.get('Referer') || req.get('Origin');
    
    if (!referer) {
      return next();
    }

    try {
      const refererUrl = new URL(referer);
      const domain = refererUrl.hostname;
      const now = Date.now();

      if (!domainRequests.has(domain)) {
        domainRequests.set(domain, {
          count: 1,
          resetTime: now + WINDOW_MS
        });
        return next();
      }

      const domainData = domainRequests.get(domain);

      // Reset if window expired
      if (now > domainData.resetTime) {
        domainData.count = 1;
        domainData.resetTime = now + WINDOW_MS;
        return next();
      }

      // Check limit
      if (domainData.count >= MAX_REQUESTS) {
        return res.status(429).json({
          status: 'error',
          message: 'Rate limit aşıldı. Lütfen daha sonra tekrar deneyin.',
          retryAfter: Math.ceil((domainData.resetTime - now) / 1000)
        });
      }

      domainData.count++;
      next();
    } catch (error) {
      next();
    }
  };
};