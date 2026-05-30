export async function onRequest(context) {
  // Same-origin upload sink.
  // Reads the request body and responds quickly. Used for upload speed timing.
  const req = context.request;

  const headers = new Headers();
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');

  // Allow cross-origin use (optional) - doesn't hurt for our static tools.
  headers.set('access-control-allow-origin', '*');
  headers.set('access-control-allow-methods', 'POST,OPTIONS');
  headers.set('access-control-allow-headers', 'content-type');

  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ ok: false, error: 'Method Not Allowed' }), { status: 405, headers });

  const t0 = Date.now();
  let bytes = 0;
  try {
    const buf = await req.arrayBuffer();
    bytes = buf.byteLength;
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Bad body' }), { status: 400, headers });
  }
  const ms = Date.now() - t0;

  // Don't reflect back the body; just stats.
  return new Response(JSON.stringify({ ok: true, bytes, ms }), { status: 200, headers });
}
