import type { APIRoute } from 'astro';
import { ZodError } from 'zod';
import { getTakeawayRepository, takeawayEnvironment, takeawayIdSecret } from '../../../lib/takeaways/config';
import { validateSaveTakeawayInput } from '../../../lib/takeaways/model';
import { IdempotencyConflictError } from '../../../lib/takeaways/repository';
import {
  buildTakeawayRecord,
  deriveTakeawayId,
  fingerprintTakeawayInput,
  normalizeTakeawayInput,
  TakeawayInputError,
} from '../../../lib/takeaways/service';

export const prerender = false;
const MAX_BODY_BYTES = 16_384;

function json(body: unknown, status: number, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function error(code: string, message: string, status: number, retryable = false) {
  return json({ status: 'error', code, message, retryable }, status);
}

function originAllowed(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin && import.meta.env.DEV) return true;
  return origin === new URL(request.url).origin;
}

export const POST: APIRoute = async ({ request }) => {
  if (!originAllowed(request)) {
    return error('invalid_input', 'This save must come from the same portfolio origin.', 403);
  }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return error('invalid_input', 'Content-Type must be application/json.', 415);
  }
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return error('invalid_input', 'The takeaway request is too large.', 413);
  }

  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
      return error('invalid_input', 'The takeaway request is too large.', 413);
    }
    const input = validateSaveTakeawayInput(
      normalizeTakeawayInput(validateSaveTakeawayInput(JSON.parse(text))),
    );
    if (!input.confirmedPublic) {
      return error(
        'confirmation_required',
        'The visitor must confirm that anyone with the unguessable link may view this takeaway.',
        422,
      );
    }
    if (request.headers.get('idempotency-key') !== input.idempotencyKey) {
      return error('invalid_input', 'The Idempotency-Key header must match the request body.', 400);
    }

    const id = deriveTakeawayId(takeawayIdSecret(), input.idempotencyKey);
    const fingerprint = fingerprintTakeawayInput(input);
    const requestOrigin = new URL(request.url).origin;
    const baseUrl = takeawayEnvironment('TAKEAWAY_BASE_URL') ?? requestOrigin;
    const record = buildTakeawayRecord(input, { id, baseUrl });
    const repository = getTakeawayRepository();
    const result = await repository.create(record, fingerprint);
    const verified = await repository.get(id);
    if (!verified) throw new Error('Takeaway read-after-write verification failed.');
    const url = new URL(`/takeaways/${id}`, baseUrl).href;
    return json(
      {
        status: result.status,
        takeawayId: id,
        url,
        printable: input.format === 'web_and_print',
        publicByLink: true,
      },
      result.status === 'created' ? 201 : 200,
      { 'Cache-Control': 'no-store' },
    );
  } catch (caught) {
    if (caught instanceof SyntaxError || caught instanceof ZodError || caught instanceof TakeawayInputError) {
      return error('invalid_input', caught instanceof TakeawayInputError ? caught.message : 'The takeaway input is invalid.', 422);
    }
    if (caught instanceof IdempotencyConflictError) {
      return error('idempotency_conflict', caught.message, 409);
    }
    console.error('Takeaway storage failed:', caught instanceof Error ? caught.message : 'unknown');
    return error('storage_unavailable', 'The takeaway could not be stored durably.', 503, true);
  }
};
