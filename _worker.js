const CANONICAL_HOST = 'boringbutstilluseful.co.uk';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- Canonical host redirect (SEO-safe) ---
    // Keep workers.dev preview/testing URLs working (no redirect there).
    const host = url.hostname;
    const isWorkersDev = host.endsWith('.workers.dev');
    const isCanonical = host === CANONICAL_HOST;
    if (!isWorkersDev && !isCanonical) {
      const dest = new URL(request.url);
      dest.protocol = 'https:';
      dest.hostname = CANONICAL_HOST;
      return new Response(null, {
        status: 301,
        headers: {
          location: dest.toString(),
          'cache-control': 'no-store'
        }
      });
    }

    // --- API routes (same-origin) ---
    if (url.pathname === '/api/ping') {
      if (request.method === 'OPTIONS') return withCors(new Response('', { status: 204 }));
      if (request.method !== 'GET') return withCors(new Response('Method Not Allowed', { status: 405 }));
      return withCors(new Response('ok', {
        status: 200,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store'
        }
      }));
    }

    if (url.pathname === '/api/upload') {
      if (request.method === 'OPTIONS') return withCors(new Response('', { status: 204 }));
      if (request.method !== 'POST') {
        return withCors(json({ ok: false, error: 'Method Not Allowed' }, 405));
      }

      const t0 = Date.now();
      let bytes = 0;
      try {
        const buf = await request.arrayBuffer();
        bytes = buf.byteLength;
      } catch {
        return withCors(json({ ok: false, error: 'Bad body' }, 400));
      }
      const ms = Date.now() - t0;

      return withCors(json({ ok: true, bytes, ms }, 200));
    }

    // --- Static asset fallback ---
    // In Cloudflare's static assets mode, ASSETS is provided.
    // If it isn't available, return a helpful error.
    if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Static asset binding (ASSETS) not found.', { status: 500 });
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function withCors(res) {
  const h = new Headers(res.headers);
  h.set('access-control-allow-origin', '*');
  h.set('access-control-allow-methods', 'GET,POST,OPTIONS');
  h.set('access-control-allow-headers', 'content-type');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}
