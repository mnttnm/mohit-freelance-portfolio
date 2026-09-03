import type { APIRoute } from 'astro';
import { getTakeawayRepository } from '../../../../lib/takeaways/config';
import { TAKEAWAY_ID_PATTERN } from '../../../../lib/takeaways/model';
import { renderTakeawayPdf } from '../../../../lib/takeaways/pdf';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  if (!params.id || !TAKEAWAY_ID_PATTERN.test(params.id)) {
    return new Response('Takeaway not found.', { status: 404 });
  }

  try {
    const record = await getTakeawayRepository().get(params.id);
    if (!record) return new Response('Takeaway not found.', { status: 404 });
    const bytes = await renderTakeawayPdf(record);
    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=31536000, immutable',
        'Content-Disposition': 'attachment; filename="mohit-tater-portfolio-takeaway.pdf"',
        'Content-Type': 'application/pdf',
      },
    });
  } catch (caught) {
    console.error('Takeaway PDF generation failed:', caught instanceof Error ? caught.message : 'unknown');
    return new Response('The PDF is temporarily unavailable.', { status: 503 });
  }
};
