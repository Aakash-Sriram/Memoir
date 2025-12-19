import { describe, it, expect, vi } from 'vitest';
import { handleNormalMode } from './useKeyboard.js';

function makeHandlers() {
  return {
    onNavigateUp: vi.fn(),
    onNavigateDown: vi.fn(),
    onNavigateLeft: vi.fn(),
    onNavigateRight: vi.fn(),
    onNavigateLineStart: vi.fn(),
    onNavigateLineEnd: vi.fn(),
    onNavigateFileStart: vi.fn(),
    onNavigateFileEnd: vi.fn(),
    onEnterInsertMode: vi.fn(),
    onEnterInsertModeAppend: vi.fn(),
    onEnterInsertModeNewLineBelow: vi.fn(),
    onEnterInsertModeNewLineAbove: vi.fn(),
    onExitInsertMode: vi.fn(),
    onStartCommand: vi.fn(),
    onCommandInput: vi.fn(),
    onCommandBackspace: vi.fn(),
    onExecuteCommand: vi.fn(),
    onCancelCommand: vi.fn(),
    onAutocomplete: vi.fn(),
    onAutocompleteUp: vi.fn(),
    onAutocompleteDown: vi.fn(),
    onAutocompleteSelect: vi.fn(),
    onAutocompleteCancel: vi.fn(),
    onSelectResult: vi.fn(),
    onExitResults: vi.fn(),
    onTextInput: vi.fn(),
    onDeleteCharBack: vi.fn(),
    onNewLine: vi.fn(),
    onQuickSearch: vi.fn(),
    onQuickPrev: vi.fn(),
    onQuickNext: vi.fn(),
    onQuickSave: vi.fn(),
    onQuickQuit: vi.fn(),
  };
}

describe('handleNormalMode', () => {
  it('moves left on h', () => {
    const handlers = makeHandlers();
    handleNormalMode('h', {} as any, handlers as any);
    expect(handlers.onNavigateLeft).toHaveBeenCalled();
  });

  it('moves right on l', () => {
    const handlers = makeHandlers();
    handleNormalMode('l', {} as any, handlers as any);
    expect(handlers.onNavigateRight).toHaveBeenCalled();
  });

  it('moves down on j', () => {
    const handlers = makeHandlers();
    handleNormalMode('j', {} as any, handlers as any);
    expect(handlers.onNavigateDown).toHaveBeenCalled();
  });

  it('moves up on k', () => {
    const handlers = makeHandlers();
    handleNormalMode('k', {} as any, handlers as any);
    expect(handlers.onNavigateUp).toHaveBeenCalled();
  });

  it('starts command on :', () => {
    const handlers = makeHandlers();
    handleNormalMode(':', {} as any, handlers as any);
    expect(handlers.onStartCommand).toHaveBeenCalled();
  });

  it('does not react to arrow keys in normal mode', () => {
    const handlers = makeHandlers();
    handleNormalMode('', { leftArrow: true } as any, handlers as any);
    expect(handlers.onNavigateLeft).not.toHaveBeenCalled();
  });
});
