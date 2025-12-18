import { describe, it, expect } from 'vitest';
import { parseCommand, executeCommand } from './commands.js';

describe('parseCommand', () => {
  it('should parse simple commands', () => {
    const result = parseCommand('next');
    expect(result.name).toBe('next');
    expect(result.args).toEqual([]);
  });

  it('should parse commands with arguments', () => {
    const result = parseCommand('search hello world');
    expect(result.name).toBe('search');
    expect(result.args).toEqual(['hello', 'world']);
  });

  it('should resolve aliases to canonical commands', () => {
    expect(parseCommand('n').name).toBe('next');
    expect(parseCommand('p').name).toBe('prev');
    expect(parseCommand('t').name).toBe('today');
    expect(parseCommand('s').name).toBe('search');
    expect(parseCommand('w').name).toBe('write');
    expect(parseCommand('q').name).toBe('quit');
    expect(parseCommand('o').name).toBe('open');
    expect(parseCommand('g').name).toBe('goto');
    expect(parseCommand('?').name).toBe('help');
  });

  it('should handle case insensitivity', () => {
    expect(parseCommand('NEXT').name).toBe('next');
    expect(parseCommand('Search query').name).toBe('search');
  });

  it('should trim whitespace', () => {
    const result = parseCommand('  next  ');
    expect(result.name).toBe('next');
  });
});

describe('executeCommand', () => {
  describe('navigation commands', () => {
    it('should return navigation result for :next', () => {
      const cmd = parseCommand('next');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'navigation', date: 'next' });
    });

    it('should return navigation result for :prev', () => {
      const cmd = parseCommand('prev');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'navigation', date: 'prev' });
    });

    it('should return navigation result for :today', () => {
      const cmd = parseCommand('today');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'navigation', date: 'today' });
    });

    it('should return navigation result for :open with date', () => {
      const cmd = parseCommand('open 2025-12-15');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'navigation', date: '2025-12-15' });
    });

    it('should return navigation result for :open with natural language', () => {
      const cmd = parseCommand('open yesterday');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'navigation', date: 'yesterday' });
    });

    it('should return error for :open without argument', () => {
      const cmd = parseCommand('open');
      const result = executeCommand(cmd);
      expect(result.type).toBe('error');
    });
  });

  describe('search commands', () => {
    it('should return search result for :search with query', () => {
      const cmd = parseCommand('search experiment');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'search', query: 'experiment' });
    });

    it('should return error for :search without query', () => {
      const cmd = parseCommand('search');
      const result = executeCommand(cmd);
      expect(result.type).toBe('error');
    });
  });

  describe('goto commands', () => {
    it('should return goto result for :goto with heading', () => {
      const cmd = parseCommand('goto Experiments');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'goto', heading: 'Experiments' });
    });

    it('should return error for :goto without heading', () => {
      const cmd = parseCommand('goto');
      const result = executeCommand(cmd);
      expect(result.type).toBe('error');
    });
  });

  describe('file operations', () => {
    it('should return save result for :write', () => {
      const cmd = parseCommand('write');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'save' });
    });

    it('should return quit result for :quit', () => {
      const cmd = parseCommand('quit');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'quit' });
    });

    it('should return save result for :wq (app handles quit after save)', () => {
      const cmd = parseCommand('wq');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'save' });
    });

    it('should return help result for :help', () => {
      const cmd = parseCommand('help');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'help' });
    });
  });

  describe('clipboard operations', () => {
    it('should return copy result for :copy', () => {
      const cmd = parseCommand('copy');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'copy' });
    });

    it('should return copy result for :y (vim yank alias)', () => {
      const cmd = parseCommand('y');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'copy' });
    });

    it('should return cut result for :cut', () => {
      const cmd = parseCommand('cut');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'cut' });
    });

    it('should return cut result for :x (vim cut alias)', () => {
      const cmd = parseCommand('x');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'cut' });
    });

    it('should return paste result for :paste', () => {
      const cmd = parseCommand('paste');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'paste' });
    });

    it('should return delete result for :delete', () => {
      const cmd = parseCommand('delete');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'delete' });
    });

    it('should return delete result for :d (vim delete alias)', () => {
      const cmd = parseCommand('d');
      const result = executeCommand(cmd);
      expect(result).toEqual({ type: 'delete' });
    });
  });

  describe('unknown commands', () => {
    it('should return error for unknown commands', () => {
      const cmd = parseCommand('unknowncommand');
      const result = executeCommand(cmd);
      expect(result.type).toBe('error');
    });
  });
});
