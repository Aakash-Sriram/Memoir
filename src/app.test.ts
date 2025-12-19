import { describe, it, expect } from 'vitest';
import { initState } from './app.js';

describe('initState', () => {
  it('initializes editor.preferredCol to 0', () => {
    const s = initState('2025-12-19');
    expect(s.editor.preferredCol).toBe(0);
  });
});
