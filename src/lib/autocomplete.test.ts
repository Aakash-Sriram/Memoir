import { describe, it, expect } from 'vitest';
import {
  autocompleteCommand,
  getInitialAutocompleteState,
  createAutocompleteState,
  navigateAutocomplete,
  getSelectedCandidate,
  COMMANDS,
  COMMANDS_WITH_ARGS,
} from './autocomplete.js';

describe('COMMANDS', () => {
  it('should include essential commands', () => {
    expect(COMMANDS).toContain('goto');
    expect(COMMANDS).toContain('open');
    expect(COMMANDS).toContain('search');
    expect(COMMANDS).toContain('next');
    expect(COMMANDS).toContain('prev');
    expect(COMMANDS).toContain('today');
    expect(COMMANDS).toContain('write');
    expect(COMMANDS).toContain('quit');
    expect(COMMANDS).toContain('help');
  });
});

describe('COMMANDS_WITH_ARGS', () => {
  it('should mark commands that expect arguments', () => {
    expect(COMMANDS_WITH_ARGS.has('goto')).toBe(true);
    expect(COMMANDS_WITH_ARGS.has('open')).toBe(true);
    expect(COMMANDS_WITH_ARGS.has('search')).toBe(true);
    expect(COMMANDS_WITH_ARGS.has('quit')).toBe(false);
    expect(COMMANDS_WITH_ARGS.has('write')).toBe(false);
  });
});

describe('autocompleteCommand', () => {
  it('should show all commands when input is empty', () => {
    const result = autocompleteCommand('');
    expect(result.candidates).toBeDefined();
    expect(result.candidates?.length).toBeGreaterThan(0);
    expect(result.candidates).toContain('goto');
    expect(result.candidates).toContain('search');
  });

  it('should show all commands when input is whitespace', () => {
    const result = autocompleteCommand('   ');
    expect(result.candidates).toBeDefined();
    expect(result.candidates?.length).toBeGreaterThan(0);
  });

  it('should complete single match inline with trailing space for arg commands', () => {
    const result = autocompleteCommand('got');
    expect(result.completion).toBe('goto ');
    expect(result.candidates).toBeUndefined();
  });

  it('should complete single match inline without trailing space for no-arg commands', () => {
    const result = autocompleteCommand('wri');
    expect(result.completion).toBe('write');
    expect(result.candidates).toBeUndefined();
  });

  it('should return multiple candidates for ambiguous prefix', () => {
    // 'o' matches 'open' only in current commands
    const result = autocompleteCommand('p');
    expect(result.candidates).toBeDefined();
    expect(result.candidates).toContain('prev');
    expect(result.candidates).toContain('paste');
  });

  it('should return empty result for no matches', () => {
    const result = autocompleteCommand('xyz');
    expect(result.completion).toBeUndefined();
    expect(result.candidates).toBeUndefined();
  });

  it('should be case-insensitive', () => {
    const result = autocompleteCommand('GOT');
    expect(result.completion).toBe('goto ');
  });

  it('should not complete when command is already complete with args', () => {
    const result = autocompleteCommand('goto Experiments');
    expect(result.completion).toBeUndefined();
    expect(result.candidates).toBeUndefined();
  });
});

describe('getInitialAutocompleteState', () => {
  it('should return inactive state', () => {
    const state = getInitialAutocompleteState();
    expect(state.active).toBe(false);
    expect(state.candidates).toEqual([]);
    expect(state.selectedIndex).toBe(0);
    expect(state.type).toBe('command');
  });
});

describe('createAutocompleteState', () => {
  it('should create active state with candidates', () => {
    const candidates = ['goto', 'open', 'search'];
    const state = createAutocompleteState(candidates, 'command');
    expect(state.active).toBe(true);
    expect(state.candidates).toEqual(candidates);
    expect(state.selectedIndex).toBe(0);
    expect(state.type).toBe('command');
  });

  it('should support argument type', () => {
    const state = createAutocompleteState(['Experiments', 'Learnings'], 'argument');
    expect(state.type).toBe('argument');
  });
});

describe('navigateAutocomplete', () => {
  it('should move down in the list', () => {
    const state = createAutocompleteState(['a', 'b', 'c']);
    const newState = navigateAutocomplete(state, 'down');
    expect(newState.selectedIndex).toBe(1);
  });

  it('should move up in the list', () => {
    const state = { ...createAutocompleteState(['a', 'b', 'c']), selectedIndex: 2 };
    const newState = navigateAutocomplete(state, 'up');
    expect(newState.selectedIndex).toBe(1);
  });

  it('should not go below 0', () => {
    const state = createAutocompleteState(['a', 'b', 'c']);
    const newState = navigateAutocomplete(state, 'up');
    expect(newState.selectedIndex).toBe(0);
  });

  it('should not exceed max index', () => {
    const state = { ...createAutocompleteState(['a', 'b', 'c']), selectedIndex: 2 };
    const newState = navigateAutocomplete(state, 'down');
    expect(newState.selectedIndex).toBe(2);
  });

  it('should return unchanged state when inactive', () => {
    const state = getInitialAutocompleteState();
    const newState = navigateAutocomplete(state, 'down');
    expect(newState).toEqual(state);
  });
});

describe('getSelectedCandidate', () => {
  it('should return selected candidate', () => {
    const state = { ...createAutocompleteState(['a', 'b', 'c']), selectedIndex: 1 };
    expect(getSelectedCandidate(state)).toBe('b');
  });

  it('should return undefined when inactive', () => {
    const state = getInitialAutocompleteState();
    expect(getSelectedCandidate(state)).toBeUndefined();
  });

  it('should return undefined when empty', () => {
    const state = createAutocompleteState([]);
    expect(getSelectedCandidate(state)).toBeUndefined();
  });
});
