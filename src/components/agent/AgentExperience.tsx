import { useEffect, useRef, useState } from 'react';
import { portfolioServices } from '../../content/portfolio';
import { getProject } from '../../content/projects';
import {
  acknowledgeUiEvent,
  WEBMCP_EVENTS,
  type WebMcpUiEnvelope,
} from '../../lib/webmcp/events';
import {
  clearPersonalizedView,
  clearPreparedInquiry,
  restoreWebMcpSession,
  savePreparedInquiry,
  type PersonalizedViewState,
  type PreparedInquiryState,
} from '../../lib/webmcp/session';
import {
  applyPreparedInquiryToForm,
  clearPreparedInquiryForm,
} from '../../lib/webmcp/contact-form';
import { buildPreparedInquiryMessage } from '../../lib/webmcp/state';
import './agent-experience.css';

type AgentPanel = 'view' | 'inquiry';

const AGENT_PANEL_DISMISSED_KEY = 'mohit:webmcp:panel-dismissed:v1';

export default function AgentExperience() {
  const [personalizedView, setPersonalizedView] = useState<PersonalizedViewState | null>(null);
  const [preparedInquiry, setPreparedInquiry] = useState<PreparedInquiryState | null>(null);
  const [activePanel, setActivePanel] = useState<AgentPanel>('view');
  const [isOpen, setIsOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  const openPanel = (panel: AgentPanel) => {
    sessionStorage.removeItem(AGENT_PANEL_DISMISSED_KEY);
    setActivePanel(panel);
    setIsOpen(true);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  useEffect(() => {
    const restored = restoreWebMcpSession();
    setPersonalizedView(restored.personalizedView);
    setPreparedInquiry(restored.preparedInquiry);
    if (restored.preparedInquiry) {
      applyPreparedInquiryToForm(restored.preparedInquiry);
      setActivePanel('inquiry');
    }
    if (
      (restored.personalizedView || restored.preparedInquiry)
      && sessionStorage.getItem(AGENT_PANEL_DISMISSED_KEY) !== 'true'
    ) {
      setIsOpen(true);
    }

    const onPersonalize = (event: CustomEvent<WebMcpUiEnvelope<PersonalizedViewState>>) => {
      setPersonalizedView(event.detail.payload);
      setLiveMessage('Your portfolio context is ready.');
      openPanel('view');
      acknowledgeUiEvent({ acknowledgementId: event.detail.acknowledgementId, applied: true });
    };
    const onPrepareInquiry = (event: CustomEvent<WebMcpUiEnvelope<PreparedInquiryState>>) => {
      const formPrefilled = applyPreparedInquiryToForm(event.detail.payload);
      setPreparedInquiry(event.detail.payload);
      setLiveMessage('Your inquiry brief is ready for review. Nothing has been sent.');
      openPanel('inquiry');
      acknowledgeUiEvent({
        acknowledgementId: event.detail.acknowledgementId,
        applied: true,
        contactFormPrefilled: formPrefilled,
      });
    };

    window.addEventListener(WEBMCP_EVENTS.personalize, onPersonalize as EventListener);
    window.addEventListener(WEBMCP_EVENTS.prepareInquiry, onPrepareInquiry as EventListener);
    return () => {
      window.removeEventListener(WEBMCP_EVENTS.personalize, onPersonalize as EventListener);
      window.removeEventListener(WEBMCP_EVENTS.prepareInquiry, onPrepareInquiry as EventListener);
    };
  }, []);

  if (!personalizedView && !preparedInquiry) return null;

  const activeProjectIds = activePanel === 'view'
    ? personalizedView?.selectedProjectIds ?? []
    : preparedInquiry?.relevantProjectIds ?? [];
  const projects = activeProjectIds
    .map((id) => getProject(id))
    .filter((project) => Boolean(project));
  const services = portfolioServices.filter((service) =>
    personalizedView?.selectedServiceIds.includes(service.id),
  );

  const dismissPanel = () => {
    sessionStorage.setItem(AGENT_PANEL_DISMISSED_KEY, 'true');
    setIsOpen(false);
  };

  const resetPersonalization = () => {
    clearPersonalizedView();
    setPersonalizedView(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
    setLiveMessage('Portfolio context reset. The original portfolio is unchanged.');
    if (preparedInquiry) setActivePanel('inquiry');
    else setIsOpen(false);
    (window as typeof window & { phTrack?: (event: string) => void }).phTrack?.(
      'webmcp_personalized_view_reset',
    );
  };

  const persistInquiry = (updated: PreparedInquiryState) => {
    setPreparedInquiry(updated);
    savePreparedInquiry(updated);
    applyPreparedInquiryToForm(updated);
  };

  const updateInquiry = (patch: Partial<PreparedInquiryState>) => {
    if (!preparedInquiry) return;
    const updated = { ...preparedInquiry, ...patch };
    persistInquiry({
      ...updated,
      contactMessage: buildPreparedInquiryMessage(updated),
    });
  };

  const updateInquiryMessage = (contactMessage: string) => {
    if (!preparedInquiry) return;
    persistInquiry({ ...preparedInquiry, contactMessage });
  };

  const linesFrom = (value: string, limit: number, maxItemLength: number) => value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.slice(0, maxItemLength))
    .slice(0, limit);

  const stackFrom = (value: string) => value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.slice(0, 60))
    .slice(0, 12);

  const goToContact = () => {
    const form = document.querySelector('#studio-contact-form');
    if (form) {
      dismissPanel();
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelector<HTMLTextAreaElement>('#studio-message')?.focus();
    } else {
      window.location.assign('/#studio-contact-form');
    }
  };

  const clearInquiry = () => {
    clearPreparedInquiry();
    clearPreparedInquiryForm();
    setPreparedInquiry(null);
    setLiveMessage('Prepared inquiry cleared without sending.');
    if (personalizedView) setActivePanel('view');
    else setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        className="agent-experience-launcher"
        type="button"
        onClick={() => openPanel(preparedInquiry ? 'inquiry' : 'view')}
      >
        <span className="agent-experience-launcher__mark" aria-hidden="true">✦</span>
        <span>
          <strong>{preparedInquiry ? 'Project brief ready' : 'Portfolio context ready'}</strong>
          <small>Open the agent-prepared view</small>
        </span>
      </button>
    );
  }

  const panelTitle = activePanel === 'inquiry'
    ? 'Review your project brief'
    : `Context for ${personalizedView?.audience ?? 'you'}`;

  return (
    <aside className="agent-experience" aria-labelledby="agent-experience-heading">
      <header className="agent-experience__masthead">
        <div className="agent-experience__status-row">
          <p className="agent-experience__eyebrow">
            <span aria-hidden="true">✦</span> MCP, meet PCM
          </p>
          <span className="agent-experience__privacy">Private to this tab</span>
        </div>
        <div className="agent-experience__title-row">
          <div>
            <h2 id="agent-experience-heading" ref={headingRef} tabIndex={-1}>{panelTitle}</h2>
            <p className="agent-experience__explanation">
              {activePanel === 'inquiry'
                ? 'Your context is organized and editable. You remain in control of the final message.'
                : 'A focused reading of the same public portfolio—selected around the decision you are making.'}
            </p>
          </div>
          <button className="agent-experience__close" type="button" onClick={dismissPanel}>
            Minimize
          </button>
        </div>
        {personalizedView && preparedInquiry && (
          <nav className="agent-experience__switcher" aria-label="Agent-prepared views">
            <button type="button" aria-pressed={activePanel === 'view'} onClick={() => setActivePanel('view')}>
              Portfolio context
            </button>
            <button type="button" aria-pressed={activePanel === 'inquiry'} onClick={() => setActivePanel('inquiry')}>
              Project brief
            </button>
          </nav>
        )}
      </header>

      <div className="agent-experience__body">
        {activePanel === 'view' && personalizedView && (
          <section aria-label="Personalized portfolio view">
            <div className="agent-experience__decision">
              <p className="agent-experience__label">The decision</p>
              <p className="agent-experience__goal">{personalizedView.goal}</p>
            </div>

            {services.length > 0 && (
              <div className="agent-experience__signals" aria-label="Relevant services">
                <p className="agent-experience__label">Strongest fit</p>
                <ul>{services.map((service) => <li key={service.id}>{service.label}</li>)}</ul>
              </div>
            )}

            <div className="agent-experience__section-heading">
              <p className="agent-experience__label">Selected evidence</p>
              <p>{projects.length} projects brought forward</p>
            </div>
            <ol className="agent-experience__projects">
              {projects.map((project, index) => project && (
                <li key={project.id}>
                  <article>
                    <div className="agent-experience__project-heading">
                      <span className="agent-experience__index">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="agent-experience__meta">{project.type}</p>
                        <h3><a href={project.canonicalPath}>{project.title}</a></h3>
                      </div>
                    </div>
                    <p className="agent-experience__outcome">{project.outcome}</p>
                    <p className="agent-experience__evidence">{Object.values(project.evidenceByTag)[0]}</p>
                    {project.evidenceGaps[0] && (
                      <details className="agent-experience__gap">
                        <summary>Evidence boundary</summary>
                        <p>{project.evidenceGaps[0]}</p>
                      </details>
                    )}
                  </article>
                </li>
              ))}
            </ol>

            {personalizedView.questions.length > 0 && (
              <div className="agent-experience__questions">
                <p className="agent-experience__label">Worth discussing</p>
                <ul>{personalizedView.questions.map((question) => <li key={question}>{question}</li>)}</ul>
              </div>
            )}

            <div className="agent-experience__actions">
              <a className="agent-experience__primary" href="/projects">Explore selected work</a>
              <button type="button" onClick={() => setLiveMessage('Ask your agent to save this context. You will confirm before a public-by-link page is created.')}>
                Ask agent to save
              </button>
              <button type="button" onClick={() => setLiveMessage('Ask your agent to prepare an inquiry. It will stay editable and unsent.')}>
                Prepare a brief
              </button>
              <button className="agent-experience__text-action" type="button" onClick={resetPersonalization}>
                Reset context
              </button>
            </div>
          </section>
        )}

        {activePanel === 'inquiry' && preparedInquiry && (
          <section className="agent-experience__inquiry" aria-label="Prepared inquiry preview">
            <div className="agent-experience__structured-brief">
              <label htmlFor="agent-inquiry-problem">
                Problem to solve
                <textarea
                  className="agent-experience__field-textarea"
                  id="agent-inquiry-problem"
                  minLength={10}
                  maxLength={800}
                  value={preparedInquiry.problem}
                  onChange={(event) => updateInquiry({ problem: event.target.value })}
                />
              </label>

              <div className="agent-experience__field-grid">
                <label htmlFor="agent-inquiry-stage">
                  Stage
                  <input
                    id="agent-inquiry-stage"
                    maxLength={100}
                    value={preparedInquiry.stage ?? ''}
                    onChange={(event) => updateInquiry({ stage: event.target.value || undefined })}
                  />
                </label>
                <label htmlFor="agent-inquiry-timeline">
                  Timeline
                  <input
                    id="agent-inquiry-timeline"
                    maxLength={120}
                    value={preparedInquiry.timeline ?? ''}
                    onChange={(event) => updateInquiry({ timeline: event.target.value || undefined })}
                  />
                </label>
                <label htmlFor="agent-inquiry-budget">
                  Budget context
                  <input
                    id="agent-inquiry-budget"
                    maxLength={160}
                    value={preparedInquiry.budgetContext ?? ''}
                    onChange={(event) => updateInquiry({ budgetContext: event.target.value || undefined })}
                  />
                </label>
              </div>

              <label htmlFor="agent-inquiry-stack">
                Current stack
                <input
                  id="agent-inquiry-stack"
                  value={preparedInquiry.stack.join(', ')}
                  placeholder="Next.js, Supabase, OpenAI"
                  onChange={(event) => updateInquiry({ stack: stackFrom(event.target.value) })}
                />
              </label>

              <label htmlFor="agent-inquiry-goals">
                What success looks like
                <textarea
                  className="agent-experience__field-textarea"
                  id="agent-inquiry-goals"
                  value={preparedInquiry.goals.join('\n')}
                  placeholder="One goal per line"
                  onChange={(event) => updateInquiry({ goals: linesFrom(event.target.value, 6, 160) })}
                />
              </label>

              <label htmlFor="agent-inquiry-questions">
                Questions to discuss
                <textarea
                  className="agent-experience__field-textarea"
                  id="agent-inquiry-questions"
                  value={preparedInquiry.questions.join('\n')}
                  placeholder="One question per line"
                  onChange={(event) => updateInquiry({ questions: linesFrom(event.target.value, 6, 160) })}
                />
              </label>

              <div className="agent-experience__field-grid agent-experience__field-grid--contact">
                <label htmlFor="agent-inquiry-name">
                  <span>Your name <em className="agent-experience__optional">Optional</em></span>
                  <input
                    id="agent-inquiry-name"
                    maxLength={50}
                    value={preparedInquiry.name ?? ''}
                    onChange={(event) => updateInquiry({ name: event.target.value || undefined })}
                  />
                </label>
                <label htmlFor="agent-inquiry-email">
                  <span>Your email <em className="agent-experience__optional">Optional</em></span>
                  <input
                    id="agent-inquiry-email"
                    type="email"
                    maxLength={254}
                    value={preparedInquiry.email ?? ''}
                    onChange={(event) => updateInquiry({ email: event.target.value || undefined })}
                  />
                </label>
              </div>
            </div>

            {projects.length > 0 && (
              <div className="agent-experience__brief-projects">
                <p className="agent-experience__label">Relevant public work</p>
                <ul>
                  {projects.map((project) => project && (
                    <li key={project.id}>
                      <a href={project.canonicalPath}>{project.title}<span aria-hidden="true"> ↗</span></a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <label htmlFor="agent-inquiry-message">Editable message</label>
            <textarea
              className="agent-experience__message-textarea"
              id="agent-inquiry-message"
              minLength={10}
              maxLength={1000}
              value={preparedInquiry.contactMessage}
              onChange={(event) => updateInquiryMessage(event.target.value)}
            />
            <p className="agent-experience__unsent"><span aria-hidden="true">●</span> Human review required · Not sent</p>
            <div className="agent-experience__actions">
              <button className="agent-experience__primary" type="button" onClick={goToContact}>
                Review in contact form
              </button>
              <button className="agent-experience__text-action" type="button" onClick={clearInquiry}>Clear brief</button>
            </div>
          </section>
        )}
      </div>

      <footer className="agent-experience__footer">
        <p className="agent-experience__live" aria-live="polite">{liveMessage}</p>
        <a href="/">Original portfolio</a>
      </footer>
    </aside>
  );
}
