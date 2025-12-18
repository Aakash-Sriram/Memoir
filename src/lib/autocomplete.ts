// Autocomplete logic for command input
//
// Design:
// - Tab triggers autocomplete
// - Prefix-based, case-insensitive matching
// - Single match → inline completion
// - Multiple matches → show selectable list
// - This is a temporary view, NOT a mode

import { AutocompleteState } from '../types.js';

// All available commands (canonical names only, not aliases)
export const COMMANDS = [
  'goto',
  'open',
  'search',
  'next',
  'prev',
  'today',
  'write',
  'quit',
  'wq',
  'help',
  'copy',
  'cut',
  'paste',
  'delete',
] as const;

// Commands that expect arguments (add trailing space on completion)
export const COMMANDS_WITH_ARGS = new Set(['goto', 'open', 'search', 'copy', 'cut', 'delete']);

export interface AutocompleteResult {
  // If single match, the completed text (with trailing space if needed)
  completion?: string;
  // If multiple matches, the candidates to show
  candidates?: string[];
  // Type of completion (for UI display)
  type?: 'command' | 'argument';
}

/**
 * Extract heading titles from markdown lines
 * @param lines Array of document lines
 * @returns Array of heading titles (without # prefix)
 */
export function extractHeadings(lines: string[]): string[] {
  const headings: string[] = [];
  
  for (const line of lines) {
    // Match any markdown heading (# to ######)
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push(match[2].trim());
    }
  }
  
  return headings;
}

/**
 * Attempt to autocomplete the current command input
 * @param input Current command input (without the leading :)
 * @param context Optional context for argument completion
 * @returns AutocompleteResult with either completion or candidates
 */
export function autocompleteCommand(
  input: string,
  context?: { lines?: string[] }
): AutocompleteResult {
  const trimmed = input.trim().toLowerCase();
  
  // If input is empty or just whitespace, show all commands
  if (!trimmed) {
    return { candidates: [...COMMANDS], type: 'command' };
  }
  
  // Check if we're completing command name or argument
  const parts = trimmed.split(/\s+/);
  
  if (parts.length === 1) {
    // Completing command name
    const matches = COMMANDS.filter(cmd => cmd.startsWith(parts[0]));
    
    if (matches.length === 0) {
      return {}; // No matches
    }
    
    if (matches.length === 1) {
      // Single match - complete inline
      const cmd = matches[0];
      const suffix = COMMANDS_WITH_ARGS.has(cmd) ? ' ' : '';
      return { completion: cmd + suffix, type: 'command' };
    }
    
    // Multiple matches - show list
    return { candidates: matches, type: 'command' };
  }
  
  // Command already complete, check for argument completion
  const command = parts[0];
  const argPrefix = parts.slice(1).join(' ');
  
  // :goto heading autocomplete
  if (command === 'goto' && context?.lines) {
    const headings = extractHeadings(context.lines);
    
    if (!argPrefix) {
      // No argument yet - show all headings
      if (headings.length > 0) {
        return { candidates: headings, type: 'argument' };
      }
      return {};
    }
    
    // Filter headings by prefix (case-insensitive)
    const lowerPrefix = argPrefix.toLowerCase();
    const matches = headings.filter(h => h.toLowerCase().startsWith(lowerPrefix));
    
    if (matches.length === 0) {
      return {};
    }
    
    if (matches.length === 1) {
      // Single match - complete inline
      return { completion: `goto ${matches[0]}`, type: 'argument' };
    }
    
    // Multiple matches - show list
    return { candidates: matches, type: 'argument' };
  }
  
  return {};
}

/**
 * Get initial autocomplete state (empty/inactive)
 */
export function getInitialAutocompleteState(): AutocompleteState {
  return {
    active: false,
    candidates: [],
    selectedIndex: 0,
    type: 'command',
  };
}

/**
 * Create active autocomplete state with candidates
 */
export function createAutocompleteState(
  candidates: string[],
  type: 'command' | 'argument' = 'command'
): AutocompleteState {
  return {
    active: true,
    candidates,
    selectedIndex: 0,
    type,
  };
}

/**
 * Navigate autocomplete selection
 */
export function navigateAutocomplete(
  state: AutocompleteState,
  direction: 'up' | 'down'
): AutocompleteState {
  if (!state.active || state.candidates.length === 0) {
    return state;
  }
  
  const maxIndex = state.candidates.length - 1;
  let newIndex = state.selectedIndex;
  
  if (direction === 'down') {
    newIndex = Math.min(maxIndex, state.selectedIndex + 1);
  } else {
    newIndex = Math.max(0, state.selectedIndex - 1);
  }
  
  return { ...state, selectedIndex: newIndex };
}

/**
 * Get the currently selected candidate
 */
export function getSelectedCandidate(state: AutocompleteState): string | undefined {
  if (!state.active || state.candidates.length === 0) {
    return undefined;
  }
  return state.candidates[state.selectedIndex];
}
