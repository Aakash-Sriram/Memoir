// Keyboard input hook for handling all key events
import { useInput, Key } from 'ink';
import { AppMode } from '../types.js';

interface KeyHandlers {
  // Navigation
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  onNavigateLeft: () => void;
  onNavigateRight: () => void;
  onNavigateLineStart: () => void;
  onNavigateLineEnd: () => void;
  onNavigateFileStart: () => void;
  onNavigateFileEnd: () => void;
  
  // Mode switching
  onEnterInsertMode: () => void;
  onEnterInsertModeEnd: () => void;
  onEnterInsertModeNewLine: () => void;
  onEnterSearchMode: () => void;
  onEnterGotoMode: () => void;
  onExitMode: () => void;
  
  // Date navigation
  onPrevDay: () => void;
  onNextDay: () => void;
  onGoToToday: () => void;
  
  // Actions
  onSave: () => void;
  onQuit: () => void;
  onExecuteSearch: () => void;
  onSelectResult: () => void;
  onDeleteChar: () => void;
  onDeleteCharBack: () => void;
  onNewLine: () => void;
  
  // Text input
  onTextInput: (char: string) => void;
  onSearchInput: (char: string) => void;
  onGotoInput: (char: string) => void;
}

export function useKeyboard(mode: AppMode, handlers: KeyHandlers) {
  useInput((input: string, key: Key) => {
    // Handle escape in any mode
    if (key.escape) {
      handlers.onExitMode();
      return;
    }

    // Handle Ctrl+C to quit
    if (input === 'c' && key.ctrl) {
      handlers.onQuit();
      return;
    }

    // Mode-specific handling
    switch (mode) {
      case 'normal':
        handleNormalMode(input, key, handlers);
        break;
      case 'insert':
        handleInsertMode(input, key, handlers);
        break;
      case 'search':
        handleSearchMode(input, key, handlers);
        break;
      case 'goto':
        handleGotoMode(input, key, handlers);
        break;
      case 'results':
        handleResultsMode(input, key, handlers);
        break;
    }
  });
}

function handleNormalMode(input: string, key: Key, handlers: KeyHandlers) {
  // Vim-like navigation
  if (input === 'j' || key.downArrow) {
    handlers.onNavigateDown();
    return;
  }
  if (input === 'k' || key.upArrow) {
    handlers.onNavigateUp();
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
  
  // Date navigation (h/l for prev/next day)
  if (input === 'h') {
    handlers.onPrevDay();
    return;
  }
  if (input === 'l') {
    handlers.onNextDay();
    return;
  }
  
  // Jump to start/end
  if (input === '0') {
    handlers.onNavigateLineStart();
    return;
  }
  if (input === '$') {
    handlers.onNavigateLineEnd();
    return;
  }
  if (input === 'G') {
    handlers.onNavigateFileEnd();
    return;
  }
  if (input === 'g') {
    // gg - go to start (simplified: just 'g')
    handlers.onNavigateFileStart();
    return;
  }
  
  // Mode switching
  if (input === 'i') {
    handlers.onEnterInsertMode();
    return;
  }
  if (input === 'a') {
    handlers.onNavigateRight();
    handlers.onEnterInsertMode();
    return;
  }
  if (input === 'A') {
    handlers.onNavigateLineEnd();
    handlers.onEnterInsertMode();
    return;
  }
  if (input === 'I') {
    handlers.onNavigateLineStart();
    handlers.onEnterInsertMode();
    return;
  }
  if (input === 'o') {
    handlers.onEnterInsertModeNewLine();
    return;
  }
  if (input === '/') {
    handlers.onEnterSearchMode();
    return;
  }
  
  // Go to date
  if (input === ':' || input === 'G' && key.shift) {
    handlers.onEnterGotoMode();
    return;
  }
  
  // Today
  if (input === 't') {
    handlers.onGoToToday();
    return;
  }
  
  // Save
  if (input === 's' && key.ctrl) {
    handlers.onSave();
    return;
  }
  if (input === 'w') {
    handlers.onSave();
    return;
  }
  
  // Quit
  if (input === 'q') {
    handlers.onQuit();
    return;
  }
  
  // Delete character
  if (input === 'x') {
    handlers.onDeleteChar();
    return;
  }
}

function handleInsertMode(input: string, key: Key, handlers: KeyHandlers) {
  // Save shortcut
  if (input === 's' && key.ctrl) {
    handlers.onSave();
    return;
  }
  
  // Backspace
  if (key.backspace || key.delete) {
    handlers.onDeleteCharBack();
    return;
  }
  
  // Enter
  if (key.return) {
    handlers.onNewLine();
    return;
  }
  
  // Tab - insert spaces
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

function handleSearchMode(input: string, key: Key, handlers: KeyHandlers) {
  // Execute search
  if (key.return) {
    handlers.onExecuteSearch();
    return;
  }
  
  // Backspace
  if (key.backspace || key.delete) {
    handlers.onSearchInput('\b');
    return;
  }
  
  // Text input for search
  if (input && !key.ctrl && !key.meta) {
    handlers.onSearchInput(input);
  }
}

function handleGotoMode(input: string, key: Key, handlers: KeyHandlers) {
  // Go to date
  if (key.return) {
    handlers.onSelectResult();
    return;
  }
  
  // Backspace
  if (key.backspace || key.delete) {
    handlers.onGotoInput('\b');
    return;
  }
  
  // Text input for date
  if (input && !key.ctrl && !key.meta) {
    handlers.onGotoInput(input);
  }
}

function handleResultsMode(input: string, key: Key, handlers: KeyHandlers) {
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
}
