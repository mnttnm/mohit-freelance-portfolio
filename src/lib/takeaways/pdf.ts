import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from 'pdf-lib';
import type { TakeawayRecord } from './model';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const colors = {
  accent: rgb(0.12, 0.31, 0.2),
  border: rgb(0.86, 0.84, 0.8),
  body: rgb(0.22, 0.22, 0.2),
  muted: rgb(0.46, 0.45, 0.42),
  surface: rgb(0.98, 0.975, 0.96),
  text: rgb(0.08, 0.08, 0.075),
};

function pdfSafe(value: string) {
  return value
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, '...')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E\n]/g, '?');
}

function publicPortfolioUrl(value: string) {
  try {
    const parsed = new URL(value, 'https://mohittater.in');
    return `https://mohittater.in${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return 'https://mohittater.in/projects';
  }
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const paragraphs = pdfSafe(text).split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const word of paragraph.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export async function renderTakeawayPdf(record: TakeawayRecord) {
  const document = await PDFDocument.create();
  document.setTitle('Portfolio takeaway - Mohit Tater');
  document.setAuthor('Mohit Tater');
  document.setSubject('Agent-prepared portfolio takeaway');
  document.setCreator('mohittater.in');

  const sans = await document.embedFont(StandardFonts.Helvetica);
  const sansBold = await document.embedFont(StandardFonts.HelveticaBold);
  const serif = await document.embedFont(StandardFonts.TimesRoman);
  const serifBold = await document.embedFont(StandardFonts.TimesRomanBold);

  let page: PDFPage;
  let y: number;

  const addPage = () => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: colors.surface,
    });
    y = PAGE_HEIGHT - MARGIN;
  };

  const ensureSpace = (height: number) => {
    if (y - height < MARGIN + 18) addPage();
  };

  const drawLines = (
    lines: string[],
    options: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      lineHeight?: number;
      x?: number;
      maxWidth?: number;
    } = {},
  ) => {
    const font = options.font ?? sans;
    const size = options.size ?? 11;
    const lineHeight = options.lineHeight ?? size * 1.45;
    const x = options.x ?? MARGIN;
    ensureSpace(lines.length * lineHeight);
    for (const line of lines) {
      if (line) page.drawText(line, { x, y, size, font, color: options.color ?? colors.body });
      y -= lineHeight;
    }
  };

  const drawParagraph = (
    text: string,
    options: Parameters<typeof drawLines>[1] = {},
  ) => {
    const font = options.font ?? sans;
    const size = options.size ?? 11;
    const x = options.x ?? MARGIN;
    const width = options.maxWidth ?? CONTENT_WIDTH - (x - MARGIN);
    drawLines(wrapText(text, font, size, width), { ...options, font, size, x });
  };

  const drawLabel = (text: string) => {
    ensureSpace(28);
    page.drawText(pdfSafe(text).toUpperCase(), {
      x: MARGIN,
      y,
      size: 9,
      font: sansBold,
      color: colors.accent,
    });
    y -= 20;
  };

  const drawHeading = (text: string, size = 26) => {
    const lines = wrapText(text, serifBold, size, CONTENT_WIDTH);
    drawLines(lines, { font: serifBold, size, color: colors.text, lineHeight: size * 1.12 });
    y -= 8;
  };

  addPage();
  drawLabel('Mohit Tater - Portfolio takeaway');
  y -= 16;
  drawHeading('A useful record of what stood out', 34);
  drawParagraph(
    `Created ${new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(record.createdAt))} - Public to anyone with this unguessable link`,
    { size: 10, color: colors.muted },
  );
  y -= 12;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    color: colors.border,
    thickness: 1,
  });
  y -= 24;
  drawLabel('Relevant for');
  drawParagraph(record.focus, { font: serif, size: 17, color: colors.text, lineHeight: 23 });
  if (record.audience) {
    y -= 3;
    drawParagraph(`Prepared for ${record.audience}`, { size: 10, color: colors.muted });
  }

  y -= 22;
  drawLabel('Selected public evidence');
  drawHeading('Work worth revisiting', 25);

  for (const project of record.projectSnapshots) {
    const titleLines = wrapText(project.title, sansBold, 15, CONTENT_WIDTH - 28);
    const outcomeLines = wrapText(project.outcome, sans, 11, CONTENT_WIDTH - 28);
    const evidenceLines = project.evidence.flatMap((item) =>
      wrapText(`- ${item}`, sans, 10, CONTENT_WIDTH - 42),
    );
    const urlLines = wrapText(publicPortfolioUrl(project.canonicalUrl), sans, 8, CONTENT_WIDTH - 28);
    const cardHeight =
      22 + titleLines.length * 19 + outcomeLines.length * 16 + evidenceLines.length * 14 + urlLines.length * 11 + 22;
    ensureSpace(cardHeight + 12);
    const cardTop = y;
    page.drawRectangle({
      x: MARGIN,
      y: cardTop - cardHeight,
      width: CONTENT_WIDTH,
      height: cardHeight,
      color: rgb(1, 1, 1),
      borderColor: colors.border,
      borderWidth: 1,
    });
    y -= 17;
    page.drawText(pdfSafe(project.id).toUpperCase(), {
      x: MARGIN + 14,
      y,
      size: 8,
      font: sansBold,
      color: colors.accent,
    });
    y -= 18;
    drawLines(titleLines, { x: MARGIN + 14, font: sansBold, size: 15, color: colors.text, lineHeight: 19 });
    drawLines(outcomeLines, { x: MARGIN + 14, size: 11, color: colors.body, lineHeight: 16 });
    y -= 2;
    drawLines(evidenceLines, { x: MARGIN + 24, size: 10, color: colors.body, lineHeight: 14 });
    y -= 3;
    drawLines(urlLines, { x: MARGIN + 14, size: 8, color: colors.accent, lineHeight: 11 });
    y = cardTop - cardHeight - 12;
  }

  if (record.capabilityLabels.length > 0) {
    ensureSpace(86);
    y -= 4;
    drawLabel('Recurring strengths');
    drawHeading('Relevant capabilities', 22);
    drawParagraph(record.capabilityLabels.join(' / '), { size: 10, color: colors.accent, lineHeight: 15 });
  }

  if (record.notes || record.questions.length > 0) {
    ensureSpace(120);
    y -= 20;
    drawLabel('Keep the context');
    drawHeading('Notes and next questions', 22);
    if (record.notes) drawParagraph(record.notes, { size: 11, lineHeight: 16 });
    for (const question of record.questions) {
      drawParagraph(`- ${question}`, { x: MARGIN + 10, size: 11, lineHeight: 16 });
    }
  }

  ensureSpace(72);
  y -= 24;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    color: colors.border,
    thickness: 1,
  });
  y -= 22;
  drawParagraph('Explore the full portfolio: https://mohittater.in/projects', { size: 9, color: colors.accent });
  drawParagraph('Contact Mohit: https://mohittater.in/#studio-footer', { size: 9, color: colors.accent });

  const pages = document.getPages();
  for (const [index, pdfPage] of pages.entries()) {
    const footer = `${index + 1} / ${pages.length}`;
    pdfPage.drawText('Mohit Tater - portfolio takeaway', {
      x: MARGIN,
      y: 28,
      size: 8,
      font: sans,
      color: colors.muted,
    });
    pdfPage.drawText(footer, {
      x: PAGE_WIDTH - MARGIN - sans.widthOfTextAtSize(footer, 8),
      y: 28,
      size: 8,
      font: sans,
      color: colors.muted,
    });
  }

  return document.save();
}
