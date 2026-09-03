import { join } from 'node:path';
import { BlobTakeawayRepository } from './blob-repository';
import { FileTakeawayRepository } from './file-repository';
import type { TakeawayRepository } from './repository';

const viteEnvironment = import.meta.env as Record<string, string | boolean | undefined>;

export function takeawayEnvironment(name: string) {
  const viteValue = viteEnvironment[name];
  return typeof viteValue === 'string' && viteValue ? viteValue : process.env[name];
}

export function takeawayIdSecret() {
  const configured = takeawayEnvironment('TAKEAWAY_ID_SECRET');
  if (configured && configured.length >= 32) return configured;
  if (import.meta.env.DEV || process.env.NODE_ENV === 'test') {
    return 'local-development-only-takeaway-secret-2026';
  }
  throw new Error('TAKEAWAY_ID_SECRET is not configured securely.');
}

export function getTakeawayRepository(): TakeawayRepository {
  const driver = takeawayEnvironment('TAKEAWAY_STORAGE_DRIVER') ??
    (import.meta.env.DEV || process.env.NODE_ENV === 'test' ? 'file' : 'vercel-blob');
  if (driver === 'file') {
    if (!import.meta.env.DEV && process.env.NODE_ENV !== 'test') {
      throw new Error('The file takeaway driver is limited to local development.');
    }
    return new FileTakeawayRepository(
      join(process.cwd(), '.data', 'webmcp-takeaways'),
    );
  }
  if (driver === 'vercel-blob') {
    const token = takeawayEnvironment('BLOB_READ_WRITE_TOKEN');
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is not configured.');
    return new BlobTakeawayRepository(token);
  }
  throw new Error(`Unsupported takeaway storage driver: ${driver}`);
}
