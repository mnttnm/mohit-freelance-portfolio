import { describe, expect, it } from 'vitest';
import { portfolioProjects } from '../../src/content/projects';

describe('canonical portfolio content', () => {
  it('uses unique stable project IDs and canonical portfolio paths', () => {
    const ids = portfolioProjects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const project of portfolioProjects) {
      expect(project.id).toMatch(/^[a-z0-9-]+$/);
      expect(project.canonicalPath).toBe(`/projects#${project.id}`);
    }
  });

  it('keeps every approved evidence statement bounded and non-empty', () => {
    for (const project of portfolioProjects) {
      const evidence = Object.values(project.evidenceByTag);
      expect(evidence.length).toBeGreaterThan(0);
      for (const statement of evidence) {
        expect(statement.trim().length).toBeGreaterThan(10);
        expect(statement.length).toBeLessThanOrEqual(400);
      }
    }
  });
});
