import { browserWebMcpAdapter } from '../lib/webmcp/adapter';
import { registerWebMcpTools } from '../lib/webmcp/register-tools';

const controller = new AbortController();

if (document.body.dataset.webmcpEnabled === 'true') {
  void registerWebMcpTools(browserWebMcpAdapter, controller.signal);
}

window.addEventListener('pagehide', () => controller.abort(), { once: true });
