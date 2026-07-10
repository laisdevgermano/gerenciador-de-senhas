const hits = new Map()

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

export function rateLimit(ip, limit = 5, windowMs = 60000) {
  const now = Date.now()
  const record = hits.get(ip)

  if (!record || now - record.start > windowMs) {
    hits.set(ip, { start: now, count: 1 })
    return { allowed: true, remaining: limit - 1 }
  }

  record.count++
  if (record.count > limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((record.start + windowMs - now) / 1000) }
  }

  return { allowed: true, remaining: limit - record.count }
}

setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of hits) {
    if (now - record.start > 120000) hits.delete(ip)
  }
}, 60000)
