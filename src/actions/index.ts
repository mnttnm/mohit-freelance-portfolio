import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Resend } from 'resend';
import validator from 'validator';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const CONTACT_FROM_EMAIL = import.meta.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';
const CONTACT_TO_EMAIL = import.meta.env.CONTACT_TO_EMAIL || 'mohittater.iiita@gmail.com';

const resend = new Resend(RESEND_API_KEY);

class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  constructor(private windowMs: number, private maxRequests: number) {
    setInterval(() => this.cleanup(), 60_000);
  }
  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) this.store.delete(key);
    }
  }
  private getClientIp(request: Request): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    );
  }
  check(request: Request): boolean {
    const ip = this.getClientIp(request);
    if (ip === 'unknown') return true;
    const now = Date.now();
    const record = this.store.get(ip);
    if (!record || now > record.resetTime) {
      this.store.set(ip, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    if (record.count >= this.maxRequests) return false;
    record.count++;
    return true;
  }
}

const rateLimiter = new RateLimiter(15 * 60 * 1000, 5);

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string(),
      email: z.string(),
      message: z.string(),
      website: z.string().optional(),
    }),
    handler: async ({ name, email, message, website }, context) => {
      if (!rateLimiter.check(context.request)) {
        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please try again later.',
        });
      }

      if (website) {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'Form submission failed.' });
      }

      if (!validator.isLength(name, { min: 2, max: 50 }) || !/^[\p{L}\p{M}\s\-'.]+$/u.test(name)) {
        throw new ActionError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Please enter a valid name.',
        });
      }

      if (!validator.isEmail(email)) {
        throw new ActionError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Please enter a valid email address.',
        });
      }

      if (!validator.isLength(message, { min: 10, max: 1000 })) {
        throw new ActionError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Message must be between 10 and 1000 characters.',
        });
      }

      const { error } = await resend.emails.send({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        replyTo: email,
        subject: `Portfolio inbound from ${validator.escape(name)}`,
        html: `
          <h2>New contact form submission</h2>
          <p><strong>Name:</strong> ${validator.escape(name)}</p>
          <p><strong>Email:</strong> ${validator.escape(email)}</p>
          <p><strong>Message:</strong></p>
          <p>${validator.escape(message).replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color:#888;font-size:12px">
            IP: ${validator.escape(context.clientAddress || 'unknown')} &middot;
            ${new Date().toISOString()}
          </p>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message. Please email me directly.',
        });
      }

      return { success: true };
    },
  }),
};
