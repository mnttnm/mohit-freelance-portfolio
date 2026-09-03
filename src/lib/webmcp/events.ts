export const WEBMCP_EVENTS = {
  personalize: 'mohit:webmcp:personalize',
  prepareInquiry: 'mohit:webmcp:prepare-inquiry',
  acknowledgement: 'mohit:webmcp:ack',
} as const;

export interface WebMcpUiEnvelope<T> {
  acknowledgementId: string;
  payload: T;
}

export interface WebMcpUiAcknowledgement {
  acknowledgementId: string;
  applied: boolean;
  contactFormPrefilled?: boolean;
}

export function dispatchUiEvent<T>(
  eventName: string,
  payload: T,
  signal: AbortSignal,
): Promise<WebMcpUiAcknowledgement> {
  if (signal.aborted) return Promise.reject(new DOMException('Cancelled', 'AbortError'));

  const acknowledgementId = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      window.removeEventListener(WEBMCP_EVENTS.acknowledgement, onAcknowledgement as EventListener);
      signal.removeEventListener('abort', onAbort);
      window.clearTimeout(timeout);
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException('Cancelled', 'AbortError'));
    };
    const onAcknowledgement = (event: CustomEvent<WebMcpUiAcknowledgement>) => {
      if (event.detail.acknowledgementId !== acknowledgementId) return;
      cleanup();
      resolve(event.detail);
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('The portfolio interface did not acknowledge the update.'));
    }, 2_500);

    window.addEventListener(
      WEBMCP_EVENTS.acknowledgement,
      onAcknowledgement as EventListener,
    );
    signal.addEventListener('abort', onAbort, { once: true });
    window.dispatchEvent(
      new CustomEvent<WebMcpUiEnvelope<T>>(eventName, {
        detail: { acknowledgementId, payload },
      }),
    );
  });
}

export function acknowledgeUiEvent(detail: WebMcpUiAcknowledgement) {
  window.dispatchEvent(
    new CustomEvent<WebMcpUiAcknowledgement>(WEBMCP_EVENTS.acknowledgement, { detail }),
  );
}
