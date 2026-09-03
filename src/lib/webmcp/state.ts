import validator from 'validator';
import { portfolioServices } from '../../content/portfolio';
import { getProject, portfolioProjects } from '../../content/projects';
import type {
  CreatePersonalizedViewInput,
  PrepareProjectInquiryInput,
} from './contracts';
import { findRelevantWork } from './relevance';
import type { PersonalizedViewState, PreparedInquiryState } from './session';

function uniqueValidProjectIds(ids: string[]) {
  return [...new Set(ids)].filter((id) => Boolean(getProject(id)));
}

function buildDiscussionQuestions(input: CreatePersonalizedViewInput) {
  const questions = [
    `Which part of ${input.goal.replace(/[?.!]+$/, '')} needs clarity first?`,
    'What would a useful first release prove?',
  ];
  if (input.priorities.length > 0) {
    questions.push(`How should ${input.priorities[0]} be measured?`);
  }
  return questions.slice(0, 3);
}

export function buildPersonalizedViewState(
  input: CreatePersonalizedViewInput,
): PersonalizedViewState & { ignoredProjectIds: string[] } {
  const providedProjectIds = uniqueValidProjectIds(input.projectIds);
  let selectedProjectIds = providedProjectIds;
  if (selectedProjectIds.length < 2) {
    const matchedProjectIds = findRelevantWork({
      context: `${input.audience}: ${input.goal}`,
      priorities: input.priorities,
      maxResults: 3,
    }).matches.map((match) => match.projectId);
    selectedProjectIds = [...new Set([...providedProjectIds, ...matchedProjectIds])].slice(0, 3);
  }

  const ignoredProjectIds = input.projectIds.filter((id) => !providedProjectIds.includes(id));
  const selectedProjects = selectedProjectIds
    .map((id) => getProject(id))
    .filter((project) => Boolean(project));
  const selectedTags = new Set(
    selectedProjects.flatMap((project) => project?.capabilities ?? []),
  );
  const selectedServiceIds = portfolioServices
    .filter((service) => service.tags.some((tag) => selectedTags.has(tag)))
    .map((service) => service.id);

  return {
    version: 1,
    viewId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    audience: input.audience,
    goal: input.goal,
    priorities: input.priorities,
    selectedProjectIds,
    selectedServiceIds,
    evidence: selectedProjects
      .flatMap((project) => Object.values(project?.evidenceByTag ?? {}))
      .slice(0, 4),
    questions: buildDiscussionQuestions(input),
    ignoredProjectIds,
  };
}

function summarizeText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const candidate = value.slice(0, Math.max(1, maxLength - 1)).trimEnd();
  const wordBoundary = candidate.lastIndexOf(' ');
  const summary = wordBoundary >= Math.floor(maxLength * 0.6)
    ? candidate.slice(0, wordBoundary)
    : candidate;
  return `${summary.trimEnd()}…`;
}

function listSection(label: string, values: string[], itemLimit: number, itemLength: number) {
  if (values.length === 0) return null;
  const items = values.slice(0, itemLimit).map((value) => `- ${summarizeText(value, itemLength)}`);
  if (values.length > itemLimit) items.push(`- ${values.length - itemLimit} more captured in the brief`);
  return `${label}:\n${items.join('\n')}`;
}

function optionalLine(label: string, value: string | undefined, maxLength: number) {
  return value ? `${label}: ${summarizeText(value, maxLength)}` : null;
}

export function buildPreparedInquiryMessage(
  input: Pick<
    PrepareProjectInquiryInput,
    'problem' | 'goals' | 'stage' | 'stack' | 'timeline' | 'budgetContext' | 'questions'
  > & { relevantProjectIds: string[] },
) {
  const projectTitles = input.relevantProjectIds
    .map((id) => getProject(id)?.title)
    .filter((title): title is string => Boolean(title));
  const sections = [
    'Hi Mohit,',
    `Problem:\n${summarizeText(input.problem, 320)}`,
    listSection('Goals', input.goals, 3, 100),
    optionalLine('Stage', input.stage, 80),
    input.stack.length
      ? `Current stack: ${summarizeText(input.stack.slice(0, 6).join(', '), 140)}`
      : null,
    optionalLine('Timeline', input.timeline, 90),
    optionalLine('Budget context', input.budgetContext, 120),
    projectTitles.length
      ? `Relevant work: ${summarizeText(projectTitles.join(', '), 160)}`
      : null,
    listSection('Questions', input.questions, 3, 100),
  ].filter((section): section is string => Boolean(section));

  const included: string[] = [];
  for (const section of sections) {
    const candidate = [...included, section].join('\n\n');
    if (candidate.length <= 1000) included.push(section);
  }
  return included.join('\n\n');
}

export function buildPreparedInquiryState(
  input: PrepareProjectInquiryInput,
): PreparedInquiryState & { ignoredProjectIds: string[] } {
  if (input.name && (!validator.isLength(input.name, { min: 2, max: 50 }) || !/^[\p{L}\p{M}\s\-'.]+$/u.test(input.name))) {
    throw new Error('Please provide a valid name or omit it.');
  }
  if (input.email && !validator.isEmail(input.email)) {
    throw new Error('Please provide a valid email address or omit it.');
  }

  const relevantProjectIds = uniqueValidProjectIds(input.relevantProjectIds);
  const ignoredProjectIds = input.relevantProjectIds.filter(
    (id) => !relevantProjectIds.includes(id),
  );
  const contactMessage = buildPreparedInquiryMessage({ ...input, relevantProjectIds });

  return {
    version: 1,
    inquiryId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
    relevantProjectIds,
    contactMessage,
    ignoredProjectIds,
  };
}

export const allCanonicalProjectIds = portfolioProjects.map((project) => project.id);
