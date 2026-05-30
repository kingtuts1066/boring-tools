export async function onRequest(context) {
  // Lightweight same-origin endpoint for latency measurement.
  // Returns a tiny response to minimise transfer-time impact.
  const headers = new Headers();
  headers.set('content-type', 'text/plain; charset=utf-8');
  headers.set('cache-control', 'no-store');

  // CORS: safe defaults (same-origin doesn’t need it, but it helps if embedded).
  headers.set('access-control-allow-origin', '*');
  headers.set('access-control-allow-methods', 'GET,OPTIONS');
  headers.set('access-control-allow-headers', 'content-type');

  const req = context.request;
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers });
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405, headers });

  return new Response('ok', { status: 200, headers });
}
