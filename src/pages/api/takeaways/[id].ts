import type { APIRoute } from 'astro';
import { getTakeawayRepository } from '../../../lib/takeaways/config';
import { TAKEAWAY_ID_PATTERN } from '../../../lib/takeaways/model';

export const prerender = false;

function json(body: unknown, status: number, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

export const GET: APIRoute = async ({ params }) => {
  if (!params.id || !TAKEAWAY_ID_PATTERN.test(params.id)) {
    return json({ status: 'error', code: 'not_found', message: 'Takeaway not found.', retryable: false }, 404);
  }
  try {
    const record = await getTakeawayRepository().get(params.id);
    if (!record) {
      return json({ status: 'error', code: 'not_found', message: 'Takeaway not found.', retryable: false }, 404);
    }
    return json(record, 200, {
      'Cache-Control': 'public, max-age=300, s-maxage=31536000, immutable',
    });
  } catch (caught) {
    console.error('Takeaway read failed:', caught instanceof Error ? caught.message : 'unknown');
    return json({ status: 'error', code: 'storage_unavailable', message: 'Takeaway storage is unavailable.', retryable: true }, 503);
  }
};
