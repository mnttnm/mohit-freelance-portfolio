import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserWebMcpAdapter } from '../../src/lib/webmcp/adapter';
import { createWebMcpTools } from '../../src/lib/webmcp/register-tools';
import { WEBMCP_RESULT_BUDGET } from '../../src/lib/webmcp/results';

describe('WebMCP tool registration surface', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('is an inert no-op when the browser does not expose WebMCP', () => {
    expect(browserWebMcpAdapter.supported()).toBe(false);
  });

  it('defines exactly the five approved tools', () => {
    expect(createWebMcpTools().map((tool) => tool.name)).toEqual([
      'understand_mohit',
      'find_relevant_work',
      'create_personalized_view',
      'save_takeaway',
      'prepare_project_inquiry',
    ]);
  });

  it('keeps the canonical overview inside the normal output budget', async () => {
    vi.stubGlobal('window', { phTrack: vi.fn() });
    const tool = createWebMcpTools().find((candidate) => candidate.name === 'understand_mohit');
    const result = await tool?.execute({}, { signal: new AbortController().signal });
    expect(typeof result).toBe('string');
    expect((result as string).length).toBeLessThanOrEqual(WEBMCP_RESULT_BUDGET);
    expect(() => JSON.parse(result as string)).not.toThrow();
  });
});
