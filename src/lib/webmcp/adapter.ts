import type {} from 'webmcp-types';

export interface WebMcpAdapter {
  supported(): boolean;
  register(tool: WebMCP.ModelContextTool, signal: AbortSignal): Promise<void>;
}

export const browserWebMcpAdapter: WebMcpAdapter = {
  supported() {
    return typeof document !== 'undefined' && Boolean(document.modelContext?.registerTool);
  },
  async register(tool, signal) {
    if (!document.modelContext) return;
    await document.modelContext.registerTool(tool, { signal });
  },
};
