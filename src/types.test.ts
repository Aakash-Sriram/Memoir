import { describe, it, expect } from 'vitest';
import { AppMode, ViewType, DEFAULT_TEMPLATE } from './types.js';

describe('AppMode', () => {
  it('should only allow normal and insert modes', () => {
    const validModes: AppMode[] = ['normal', 'insert'];
    expect(validModes).toContain('normal');
    expect(validModes).toContain('insert');
    expect(validModes.length).toBe(2);
  });
});

describe('ViewType', () => {
  it('should only allow editor and results views', () => {
    const validViews: ViewType[] = ['editor', 'results'];
    expect(validViews).toContain('editor');
    expect(validViews).toContain('results');
    expect(validViews.length).toBe(2);
  });
});

describe('DEFAULT_TEMPLATE', () => {
  it('should return a string containing the date as heading', () => {
    const template = DEFAULT_TEMPLATE('2025-12-17');
    expect(template).toContain('# 2025-12-17');
  });

  it('should include standard sections', () => {
    const template = DEFAULT_TEMPLATE('2025-12-17');
    expect(template).toContain('## Thoughts');
    expect(template).toContain('## Experiments');
    expect(template).toContain('## Learnings');
    expect(template).toContain('## Quotes');
  });
});
