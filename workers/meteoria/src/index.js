// Meteoria AI Crawler Tracking + Bot Content Override - Cloudflare Worker
// Serves custom HTML to AI bots while showing the original page to humans.
// Only AI bot traffic is forwarded to Meteoria (humans pass through untouched).
// Deploy with a route wildcard, e.g. www.example.com/* (not only example.com).

const AI_BOT_PATTERNS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-Web', 'Claude-SearchBot', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended',
  'GrokBot', 'Meta-ExternalAgent',
  'Applebot-Extended', 'MistralAI-User',
  'Bytespider', 'CCBot',
  'cohere-ai', 'Diffbot', 'FacebookBot'
];

function isAIBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return AI_BOT_PATTERNS.some(p => ua.includes(p.toLowerCase()));
}

export default {
  async fetch(request, env, ctx) {
    const ua = request.headers.get('user-agent') || '';
    const requestUrl = new URL(request.url);

    if (isAIBot(ua)) {
      try {
        const serveUrl = 'https://app.meteoria.ai/api/crawler-analytics/bot-content/serve?token=METEORIA_TOKEN_A_REMPLIR&path=' + encodeURIComponent(requestUrl.pathname);
        const botRes = await fetch(serveUrl, { headers: { 'Accept': 'application/json' } });
        if (botRes.ok) {
          const data = await botRes.json();
          if (data.found && data.botHtml) {
            const overrideHeaders = {
              'Content-Type': 'text/html; charset=utf-8',
              'X-Meteoria-Bot-Content': 'true',
              'Cache-Control': 'no-store, no-cache'
            };
            let overrideHeaderBytes = 0;
            for (const [k, v] of Object.entries(overrideHeaders)) {
              overrideHeaderBytes += k.length + v.length + 4;
            }
            const overrideBodyBytes = new TextEncoder().encode(data.botHtml).length;
            ctx.waitUntil(forwardToMeteoria(request, requestUrl, ua, {
              bytes: overrideHeaderBytes + overrideBodyBytes,
              status: 200
            }));
            return new Response(data.botHtml, { status: 200, headers: overrideHeaders });
          }
        }
      } catch (_) { /* fallback to origin */ }

      // Bot without content override - still track the visit
      const response = await fetch(request);
      const responseClone = response.clone();
      ctx.waitUntil(forwardToMeteoria(request, requestUrl, ua, { response: responseClone }));
      return response;
    }

    // Human visitor - pass through without calling Meteoria
    return fetch(request);
  }
};

async function forwardToMeteoria(request, requestUrl, ua, opts) {
  let bytesSent;
  let statusCode;
  if (opts.response) {
    let headerSize = 0;
    for (const [key, value] of opts.response.headers.entries()) {
      headerSize += key.length + value.length + 4;
    }
    const bodyBlob = await opts.response.blob();
    bytesSent = headerSize + bodyBlob.size;
    statusCode = opts.response.status;
  } else {
    bytesSent = opts.bytes;
    statusCode = opts.status;
  }

  await fetch('https://app.meteoria.ai/api/crawler-analytics/server-track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: 'mt_c6179aaf275f44feb1fb1c687ed37340',
      path: requestUrl.pathname,
      requestUrl: request.url,
      userAgent: ua,
      ip: request.headers.get('cf-connecting-ip') || '',
      source: 'cloudflare',
      bytes_sent: bytesSent,
      status_code: statusCode
    })
  }).catch(() => {});
}
