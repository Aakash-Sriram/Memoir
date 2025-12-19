// Keyboard input hook
//
// Design contract:
// - Only two modes: Normal and Insert
// - : triggers command input (not a mode change)
// - Views may change, modes do not

import { useInput, Key } from 'ink';
import { AppMode, ViewType } from '../types.js';

interface KeyHandlers {
  // Cursor navigation (works in both modes, with nuance)
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  onNavigateLeft: () => void;
  onNavigateRight: () => void;
  onNavigateLineStart: () => void;
  onNavigateLineEnd: () => void;
  onNavigateFileStart: () => void;
  onNavigateFileEnd: () => void;
  
  // Mode switching (only two modes!)
  onEnterInsertMode: () => void;
  onEnterInsertModeAppend: () => void;
  onEnterInsertModeNewLineBelow: () => void;
  onEnterInsertModeNewLineAbove: () => void;
  onExitInsertMode: () => void;
  
  // Command input (not a mode!)
  onStartCommand: () => void;
  onCommandInput: (char: string) => void;
  onCommandBackspace: () => void;
  onExecuteCommand: () => void;
  onCancelCommand: () => void;
  
  // Autocomplete (temporary overlay, not a mode)
  onAutocomplete: () => void;
  onAutocompleteUp: () => void;
  onAutocompleteDown: () => void;
  onAutocompleteSelect: () => void;
  onAutocompleteCancel: () => void;
  
  // Results navigation (a view, not a mode)
  onSelectResult: () => void;
  onExitResults: () => void;
  
  // Text editing (Insert mode)
  onTextInput: (char: string) => void;
  onDeleteCharBack: () => void;
  onNewLine: () => void;
  
  // Quick aliases (optional accelerators)
  onQuickSearch: () => void;      // / in normal mode
  onQuickPrev: () => void;        // h in normal mode  
  onQuickNext: () => void;        // l in normal mode
  onQuickSave: () => void;        // Ctrl+S anywhere
  onQuickQuit: () => void;        // Ctrl+C
}

interface KeyboardState {
  mode: AppMode;
  view: ViewType;
  commandActive: boolean;
  autocompleteActive: boolean;
}

export function useKeyboard(state: KeyboardState, handlers: KeyHandlers) {
  const { mode, view, commandActive, autocompleteActive } = state;
  
  useInput((input: string, key: Key) => {
    // Global: Ctrl+C always quits
    if (input === 'c' && key.ctrl) {
      handlers.onQuickQuit();
      return;
    }
    
    // Global: Ctrl+S always saves
    if (input === 's' && key.ctrl) {
      handlers.onQuickSave();
      return;
    }
    
    // Global: Ctrl+H / Ctrl+L act as quickPrev / quickNext (note navigation)
    // Only active in Normal mode (do not trigger while editing commands or in Insert mode)
    if (input === 'h' && key.ctrl && mode === 'normal' && !commandActive) {
      handlers.onQuickPrev();
      return;
    }
    if (input === 'l' && key.ctrl && mode === 'normal' && !commandActive) {
      handlers.onQuickNext();
      return;
    }
    
    // Command input active (not a mode, just a UI state)
    if (commandActive) {
      handleCommandInput(input, key, handlers, autocompleteActive);
      return;
    }
    
    // Results view (still in Normal mode)
    if (view === 'results' && mode === 'normal') {
      handleResultsView(input, key, handlers);
      return;
    }
    
    // Mode-specific handling
    if (mode === 'insert') {
      handleInsertMode(input, key, handlers);
    } else {
      handleNormalMode(input, key, handlers);
    }
  });
}

function handleNormalMode(input: string, key: Key, handlers: KeyHandlers) {
  // : starts command input
  if (input === ':') {
    handlers.onStartCommand();
    return;
  }
  
  // Escape does nothing in normal mode (already normal)
  if (key.escape) {
    return;
  }
  
  // Cursor navigation (Vim-like keys only in Normal mode)
  if (input === 'j') {
    handlers.onNavigateDown();
    return;
  }
  if (input === 'k') {
    handlers.onNavigateUp();
    return;
  }
  if (input === '0') {
    handlers.onNavigateLineStart();
    return;
  }
  if (input === '$') {
    handlers.onNavigateLineEnd();
    return;
  }
  if (input === 'g') {
    handlers.onNavigateFileStart();
    return;
  }
  if (input === 'G') {
    handlers.onNavigateFileEnd();
    return;
  }
  
  // Enter insert mode
  if (input === 'i') {
    handlers.onEnterInsertMode();
    return;
  }
  if (input === 'a') {
    handlers.onEnterInsertModeAppend();
    return;
  }
  if (input === 'o') {
    handlers.onEnterInsertModeNewLineBelow();
    return;
  }
  if (input === 'O') {
    handlers.onEnterInsertModeNewLineAbove();
    return;
  }
  
  // Quick aliases (accelerators, not required)
  if (input === '/') {
    handlers.onQuickSearch();
    return;
  }
  // Vim-like horizontal movement: h -> left, l -> right
  if (input === 'h') {
    handlers.onNavigateLeft();
    return;
  }
  if (input === 'l') {
    handlers.onNavigateRight();
    return;
  }
}

function handleInsertMode(input: string, key: Key, handlers: KeyHandlers) {
  // Escape returns to normal mode
  if (key.escape) {
    handlers.onExitInsertMode();
    return;
  }
  
  // Backspace
  if (key.backspace || key.delete) {
    handlers.onDeleteCharBack();
    return;
  }
  
  // Enter creates new line
  if (key.return) {
    handlers.onNewLine();
    return;
  }
  
  // Tab inserts spaces
  if (key.tab) {
    handlers.onTextInput('  ');
    return;
  }
  
  // Arrow keys for cursor movement
  if (key.upArrow) {
    handlers.onNavigateUp();
    return;
  }
  if (key.downArrow) {
    handlers.onNavigateDown();
    return;
  }
  if (key.leftArrow) {
    handlers.onNavigateLeft();
    return;
  }
  if (key.rightArrow) {
    handlers.onNavigateRight();
    return;
  }
  
  // Regular text input
  if (input && !key.ctrl && !key.meta) {
    handlers.onTextInput(input);
  }
}

function handleCommandInput(input: string, key: Key, handlers: KeyHandlers, autocompleteActive: boolean) {
  // When autocomplete is active, handle navigation
  if (autocompleteActive) {
    if (key.escape) {
      handlers.onAutocompleteCancel();
      return;
    }
    if (key.return) {
      handlers.onAutocompleteSelect();
      return;
    }
    if (input === 'j' || key.downArrow) {
      handlers.onAutocompleteDown();
      return;
    }
    if (input === 'k' || key.upArrow) {
      handlers.onAutocompleteUp();
      return;
    }
    // Any other key cancels autocomplete and falls through
    handlers.onAutocompleteCancel();
  }
  
  // Escape cancels command
  if (key.escape) {
    handlers.onCancelCommand();
    return;
  }
  
  // Enter executes command
  if (key.return) {
    handlers.onExecuteCommand();
    return;
  }
  
  // Tab triggers autocomplete
  if (key.tab) {
    handlers.onAutocomplete();
    return;
  }
  
  // Backspace
  if (key.backspace || key.delete) {
    handlers.onCommandBackspace();
    return;
  }
  
  // Text input for command
  if (input && !key.ctrl && !key.meta) {
    handlers.onCommandInput(input);
  }
}

function handleResultsView(input: string, key: Key, handlers: KeyHandlers) {
  // Escape returns to editor
  if (key.escape) {
    handlers.onExitResults();
    return;
  }
  
  // Navigate results
  if (input === 'j' || key.downArrow) {
    handlers.onNavigateDown();
    return;
  }
  if (input === 'k' || key.upArrow) {
    handlers.onNavigateUp();
    return;
  }
  
  // Select result
  if (key.return) {
    handlers.onSelectResult();
    return;
  }
  
  // : starts command even in results view
  if (input === ':') {
    handlers.onStartCommand();
    return;
  }
}

