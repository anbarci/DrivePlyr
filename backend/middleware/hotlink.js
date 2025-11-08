const hotlinkProtection = (req, res, next) => {
  const referer = req.headers.referer || req.headers.origin || '';
  const allowedDomains = (process.env.ALLOWED_DOMAINS || '').split(',').filter(d => d.trim());

  if (!referer) return next();

  try {
    const refererDomain = new URL(referer).hostname;
    const isAllowed = allowedDomains.some(domain => {
      if (domain.includes('*')) {
        const regex = new RegExp('^' + domain.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        return regex.test(refererDomain);
      }
      return domain === refererDomain;
    });

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: 'Bu domain’den eriş izni yok' });
    }
  } catch (error) {
    // Invalid URL format, allow request
  }

  next();
};

module.exports = hotlinkProtection;