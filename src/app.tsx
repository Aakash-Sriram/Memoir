// Memoir - Minimal TUI Notes App
//
// Design contract:
// - Only two modes: Normal and Insert
// - Commands via : prefix (not modes)
// - Views may change (editor, results), modes do not

import React, { useState, useCallback } from 'react';
import { Box, Text, useApp, useStdout } from 'ink';
import { AppState, ViewType, AutocompleteState } from './types.js';
import { loadNote, saveNote, searchNotes } from './lib/storage.js';
import { getToday, getYesterday, getTomorrow, parseDate } from './lib/dates.js';
import { parseCommand, executeCommand } from './lib/commands.js';
import { autocompleteCommand, getInitialAutocompleteState, createAutocompleteState, navigateAutocomplete, getSelectedCandidate, COMMANDS_WITH_ARGS } from './lib/autocomplete.js';
import { copyToClipboard, pasteFromClipboard } from './lib/clipboard.js';
import { StatusBar } from './components/StatusBar.js';
import { Editor } from './components/Editor.js';
import { SearchResults } from './components/SearchResults.js';
import { AutocompleteList } from './components/AutocompleteList.js';
import { useKeyboard } from './hooks/useKeyboard.js';

// Initialize state for a given date
function initState(date: string): AppState {
  const note = loadNote(date);
  const lines = note.content.split('\n');
  
  return {
    mode: 'normal',
    view: 'editor',
    currentDate: date,
    note,
    editor: {
      cursorLine: 0,
      cursorCol: 0,
        preferredCol: 0,
      scrollOffset: 0,
      lines
    },
    command: {
      active: false,
      input: '',
      hint: undefined
    },
    autocomplete: getInitialAutocompleteState(),
    searchQuery: '',
    searchResults: [],
    selectedResultIndex: 0,
    message: '',
    dirty: false
  };
}

export default function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [state, setState] = useState<AppState>(() => initState(getToday()));
  
  const terminalHeight = stdout?.rows ?? 24;
  const editorHeight = Math.max(terminalHeight - 5, 10);
  
  // Save current note
  const saveCurrentNote = useCallback(() => {
    const content = state.editor.lines.join('\n');
    saveNote({ ...state.note, content, exists: true });
    setState(prev => ({ 
      ...prev, 
      dirty: false, 
      note: { ...prev.note, content, exists: true },
      message: 'Saved!' 
    }));
    setTimeout(() => setState(prev => ({ ...prev, message: '' })), 2000);
  }, [state.editor.lines, state.note]);
  
  // Navigate to a different date
  const navigateToDate = useCallback((dateInput: string) => {
    let targetDate: string | null = null;
    
    switch (dateInput.toLowerCase()) {
      case 'next':
      case 'tomorrow':
        targetDate = getTomorrow(state.currentDate);
        break;
      case 'prev':
      case 'previous':
      case 'yesterday':
        targetDate = getYesterday(state.currentDate);
        break;
      case 'today':
        targetDate = getToday();
        break;
      default:
        targetDate = parseDate(dateInput);
    }
    
    if (!targetDate) {
      setState(prev => ({ ...prev, message: `Invalid date: ${dateInput}` }));
      setTimeout(() => setState(prev => ({ ...prev, message: '' })), 3000);
      return;
    }
    
    if (state.dirty) {
      const content = state.editor.lines.join('\n');
      saveNote({ ...state.note, content });
    }
    
    setState(initState(targetDate));
  }, [state.currentDate, state.dirty, state.editor.lines, state.note]);
  
  // Jump to heading in current note
  const gotoHeading = useCallback((heading: string) => {
    const lowerHeading = heading.toLowerCase();
    const lineIndex = state.editor.lines.findIndex(line => {
      const lowerLine = line.toLowerCase();
      return lowerLine.startsWith('#') && lowerLine.includes(lowerHeading);
    });
    
    if (lineIndex !== -1) {
      setState(prev => ({
        ...prev,
        editor: {
          ...prev.editor,
          cursorLine: lineIndex,
          cursorCol: 0,
          preferredCol: 0,
          scrollOffset: Math.max(0, lineIndex - 3)
        },
        message: ''
      }));
    } else {
      setState(prev => ({ ...prev, message: `Heading not found: ${heading}` }));
      setTimeout(() => setState(prev => ({ ...prev, message: '' })), 3000);
    }
  }, [state.editor.lines]);
  
  // Execute a command string
  const runCommand = useCallback((input: string) => {
    const parsed = parseCommand(input);
    const result = executeCommand(parsed);
    
    switch (result.type) {
      case 'navigation':
        navigateToDate(result.date);
        break;
        
      case 'goto':
        gotoHeading(result.heading);
        break;
        
      case 'search': {
        const results = searchNotes(result.query);
        setState(prev => ({
          ...prev,
          view: 'results',
          searchQuery: result.query,
          searchResults: results,
          selectedResultIndex: 0,
          command: { active: false, input: '', hint: 'search' }
        }));
        break;
      }
        
      case 'save':
        saveCurrentNote();
        if (parsed.name === 'wq') {
          setTimeout(() => exit(), 100);
        }
        break;
        
      case 'quit':
        if (state.dirty) {
          saveCurrentNote();
        }
        exit();
        break;
        
      case 'help':
        setState(prev => ({
          ...prev,
          message: ':next :prev :today :open <date> :goto <heading> :search <query> :write :quit :copy :cut :paste :delete'
        }));
        setTimeout(() => setState(prev => ({ ...prev, message: '' })), 5000);
        break;
      
      case 'copy':
        setState(prev => {
          const line = prev.editor.lines[prev.editor.cursorLine] ?? '';
          copyToClipboard(line);
          return { ...prev, message: 'Copied line' };
        });
        setTimeout(() => setState(prev => ({ ...prev, message: '' })), 2000);
        break;
      
      case 'cut':
        setState(prev => {
          const { cursorLine, lines } = prev.editor;
          const line = lines[cursorLine] ?? '';
          copyToClipboard(line);
          
          // Remove line
          const newLines = lines.length === 1 
            ? [''] 
            : lines.filter((_, i) => i !== cursorLine);
          const newCursorLine = Math.min(cursorLine, newLines.length - 1);
          const newCursorCol = Math.min(prev.editor.cursorCol, (newLines[newCursorLine] ?? '').length);
          
          return {
            ...prev,
            dirty: true,
            editor: {
              ...prev.editor,
              lines: newLines,
              cursorLine: newCursorLine,
              cursorCol: newCursorCol,
              preferredCol: newCursorCol
            },
            message: 'Cut line'
          };
        });
        setTimeout(() => setState(prev => ({ ...prev, message: '' })), 2000);
        break;
      
      case 'delete':
        setState(prev => {
          const { cursorLine, lines } = prev.editor;
          
          // Remove line
          const newLines = lines.length === 1 
            ? [''] 
            : lines.filter((_, i) => i !== cursorLine);
          const newCursorLine = Math.min(cursorLine, newLines.length - 1);
          const newCursorCol = Math.min(prev.editor.cursorCol, (newLines[newCursorLine] ?? '').length);
          
          return {
            ...prev,
            dirty: true,
            editor: {
              ...prev.editor,
              lines: newLines,
              cursorLine: newCursorLine,
              cursorCol: newCursorCol,
              preferredCol: newCursorCol
            },
            message: 'Deleted line'
          };
        });
        setTimeout(() => setState(prev => ({ ...prev, message: '' })), 2000);
        break;
      
      case 'paste':
        setState(prev => {
          const text = pasteFromClipboard();
          if (!text) {
            return { ...prev, message: 'Clipboard empty' };
          }
          
          const { cursorLine, lines } = prev.editor;
          const newLines = [...lines];
          // Insert pasted line below current line
          newLines.splice(cursorLine + 1, 0, text);
          
          return {
            ...prev,
            dirty: true,
            editor: {
              ...prev.editor,
              lines: newLines,
              cursorLine: cursorLine + 1,
              cursorCol: 0,
              preferredCol: 0
            },
            message: 'Pasted'
          };
        });
        setTimeout(() => setState(prev => ({ ...prev, message: '' })), 2000);
        break;
        
      case 'error':
        setState(prev => ({ ...prev, message: result.message }));
        setTimeout(() => setState(prev => ({ ...prev, message: '' })), 3000);
        break;
        
      case 'success':
        break;
    }
    
    if (result.type !== 'search') {
      setState(prev => ({ ...prev, command: { active: false, input: '', hint: undefined } }));
    }
  }, [navigateToDate, gotoHeading, saveCurrentNote, state.dirty, exit]);
  
  // Update cursor
  const updateCursor = useCallback((line: number, col: number) => {
    setState(prev => {
      const maxLine = prev.editor.lines.length - 1;
      const newLine = Math.max(0, Math.min(line, maxLine));
      const lineContent = prev.editor.lines[newLine] ?? '';

      // Determine desired column. If moving vertically (line changed), prefer remembered column.
      const wasLine = prev.editor.cursorLine;
      const remembered = typeof prev.editor.preferredCol === 'number' ? prev.editor.preferredCol : prev.editor.cursorCol;

      let desiredCol: number;
      if (newLine !== wasLine) {
        desiredCol = remembered;
      } else if (col === Infinity) {
        desiredCol = lineContent.length;
      } else {
        desiredCol = col;
      }

      const newCol = Math.max(0, Math.min(desiredCol, lineContent.length));

      let newScroll = prev.editor.scrollOffset;
      if (newLine < newScroll) {
        newScroll = newLine;
      } else if (newLine >= newScroll + editorHeight) {
        newScroll = newLine - editorHeight + 1;
      }

      return {
        ...prev,
        editor: {
          ...prev.editor,
          cursorLine: newLine,
          cursorCol: newCol,
          preferredCol: newCol,
          scrollOffset: newScroll
        }
      };
    });
  }, [editorHeight]);
  
  // Keyboard handlers
  const handlers = {
    onNavigateUp: () => {
      if (state.view === 'results') {
        setState(prev => ({
          ...prev,
          selectedResultIndex: Math.max(0, prev.selectedResultIndex - 1)
        }));
      } else {
        updateCursor(state.editor.cursorLine - 1, state.editor.cursorCol);
      }
    },
    onNavigateDown: () => {
      if (state.view === 'results') {
        setState(prev => ({
          ...prev,
          selectedResultIndex: Math.min(prev.searchResults.length - 1, prev.selectedResultIndex + 1)
        }));
      } else {
        updateCursor(state.editor.cursorLine + 1, state.editor.cursorCol);
      }
    },
    onNavigateLeft: () => updateCursor(state.editor.cursorLine, state.editor.cursorCol - 1),
    onNavigateRight: () => updateCursor(state.editor.cursorLine, state.editor.cursorCol + 1),
    onNavigateLineStart: () => updateCursor(state.editor.cursorLine, 0),
    onNavigateLineEnd: () => updateCursor(state.editor.cursorLine, Infinity),
    onNavigateFileStart: () => updateCursor(0, 0),
    onNavigateFileEnd: () => updateCursor(Infinity, 0),
    
    onEnterInsertMode: () => setState(prev => ({ ...prev, mode: 'insert', message: '' })),
    onEnterInsertModeAppend: () => {
      updateCursor(state.editor.cursorLine, state.editor.cursorCol + 1);
      setState(prev => ({ ...prev, mode: 'insert', message: '' }));
    },
    onEnterInsertModeNewLineBelow: () => {
      setState(prev => {
        const currentLine = prev.editor.lines[prev.editor.cursorLine] || '';
        const indentMatch = currentLine.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '';
        
        const newLines = [...prev.editor.lines];
        newLines.splice(prev.editor.cursorLine + 1, 0, indent);
        return {
          ...prev,
          mode: 'insert',
          dirty: true,
          editor: {
            ...prev.editor,
            lines: newLines,
            cursorLine: prev.editor.cursorLine + 1,
            cursorCol: indent.length,
            preferredCol: indent.length
          },
          message: ''
        };
      });
    },
    onEnterInsertModeNewLineAbove: () => {
      setState(prev => {
        const currentLine = prev.editor.lines[prev.editor.cursorLine] || '';
        const indentMatch = currentLine.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '';
        
        const newLines = [...prev.editor.lines];
        newLines.splice(prev.editor.cursorLine, 0, indent);
        return {
          ...prev,
          mode: 'insert',
          dirty: true,
          editor: {
            ...prev.editor,
            lines: newLines,
            cursorCol: indent.length,
            preferredCol: indent.length
          },
          message: ''
        };
      });
    },
    onExitInsertMode: () => setState(prev => ({ ...prev, mode: 'normal' })),
    
    onStartCommand: () => setState(prev => ({ 
      ...prev, 
      command: { active: true, input: '', hint: undefined } 
    })),
    onCommandInput: (char: string) => setState(prev => ({
      ...prev,
      command: { ...prev.command, input: prev.command.input + char }
    })),
    onCommandBackspace: () => setState(prev => ({
      ...prev,
      command: { ...prev.command, input: prev.command.input.slice(0, -1) }
    })),
    onExecuteCommand: () => runCommand(state.command.input),
    onCancelCommand: () => setState(prev => ({ 
      ...prev, 
      command: { active: false, input: '', hint: undefined },
      autocomplete: getInitialAutocompleteState()
    })),
    
    // Autocomplete handlers
    onAutocomplete: () => {
      const result = autocompleteCommand(state.command.input, { lines: state.editor.lines });
      if (result.completion) {
        // Single match: inline completion
        setState(prev => ({
          ...prev,
          command: { ...prev.command, input: result.completion! }
        }));
      } else if (result.candidates && result.candidates.length > 0) {
        // Multiple matches: show list
        setState(prev => ({
          ...prev,
          autocomplete: createAutocompleteState(result.candidates!, result.type || 'command')
        }));
      }
    },
    onAutocompleteUp: () => setState(prev => ({
      ...prev,
      autocomplete: navigateAutocomplete(prev.autocomplete, 'up')
    })),
    onAutocompleteDown: () => setState(prev => ({
      ...prev,
      autocomplete: navigateAutocomplete(prev.autocomplete, 'down')
    })),
    onAutocompleteSelect: () => {
      const selected = getSelectedCandidate(state.autocomplete);
      if (!selected) return;
      
      if (state.autocomplete.type === 'argument') {
        // For argument completion, replace just the argument part
        const spaceIndex = state.command.input.indexOf(' ');
        const commandPart = state.command.input.slice(0, spaceIndex + 1);
        setState(prev => ({
          ...prev,
          command: { ...prev.command, input: commandPart + selected },
          autocomplete: getInitialAutocompleteState()
        }));
      } else {
        // For command completion
        const needsSpace = COMMANDS_WITH_ARGS.has(selected);
        setState(prev => ({
          ...prev,
          command: { ...prev.command, input: needsSpace ? selected + ' ' : selected },
          autocomplete: getInitialAutocompleteState()
        }));
      }
    },
    onAutocompleteCancel: () => setState(prev => ({
      ...prev,
      autocomplete: getInitialAutocompleteState()
    })),
    
    onSelectResult: () => {
      if (state.searchResults.length > 0) {
        const result = state.searchResults[state.selectedResultIndex];
        navigateToDate(result.date);
        setTimeout(() => {
          updateCursor(result.line - 1, 0);
          setState(prev => ({ ...prev, view: 'editor', command: { active: false, input: '', hint: undefined } }));
        }, 50);
      }
    },
    onExitResults: () => setState(prev => ({ 
      ...prev, 
      view: 'editor',
      command: { active: false, input: '', hint: undefined }
    })),
    
    onTextInput: (char: string) => {
      setState(prev => {
        const lines = [...prev.editor.lines];
        const { cursorLine, cursorCol } = prev.editor;
        const line = lines[cursorLine] ?? '';
        
        lines[cursorLine] = line.slice(0, cursorCol) + char + line.slice(cursorCol);
        
        return {
          ...prev,
          dirty: true,
          editor: {
            ...prev.editor,
            lines,
            cursorCol: cursorCol + char.length,
            preferredCol: cursorCol + char.length
          }
        };
      });
    },
    onDeleteCharBack: () => {
      setState(prev => {
        const lines = [...prev.editor.lines];
        const { cursorLine, cursorCol } = prev.editor;
        
        if (cursorCol > 0) {
          const line = lines[cursorLine];
          lines[cursorLine] = line.slice(0, cursorCol - 1) + line.slice(cursorCol);
          return {
            ...prev,
            dirty: true,
            editor: {
              ...prev.editor,
              lines,
              cursorCol: cursorCol - 1,
              preferredCol: cursorCol - 1
            }
          };
        } else if (cursorLine > 0) {
          const prevLine = lines[cursorLine - 1];
          const currentLine = lines[cursorLine];
          lines[cursorLine - 1] = prevLine + currentLine;
          lines.splice(cursorLine, 1);
          return {
            ...prev,
            dirty: true,
            editor: {
              ...prev.editor,
              lines,
              cursorLine: cursorLine - 1,
              cursorCol: prevLine.length,
              preferredCol: prevLine.length
            }
          };
        }
        return prev;
      });
    },
    onNewLine: () => {
      setState(prev => {
        const lines = [...prev.editor.lines];
        const { cursorLine, cursorCol } = prev.editor;
        const line = lines[cursorLine];
        
        const before = line.slice(0, cursorCol);
        const after = line.slice(cursorCol);
        lines[cursorLine] = before;
        lines.splice(cursorLine + 1, 0, after);
        
        return {
          ...prev,
          dirty: true,
          editor: {
            ...prev.editor,
            lines,
            cursorLine: cursorLine + 1,
            cursorCol: 0,
            preferredCol: 0
          }
        };
      });
    },
    
    onQuickSearch: () => setState(prev => ({ 
      ...prev, 
      command: { active: true, input: 'search ', hint: undefined } 
    })),
    onQuickPrev: () => navigateToDate('prev'),
    onQuickNext: () => navigateToDate('next'),
    onQuickSave: () => saveCurrentNote(),
    onQuickQuit: () => {
      if (state.dirty) {
        saveCurrentNote();
      }
      exit();
    }
  };
  
  useKeyboard({
    mode: state.mode,
    view: state.view,
    commandActive: state.command.active,
    autocompleteActive: state.autocomplete.active
  }, handlers);
  
  const reservedLines = state.command.active ? 5 : 4;
  
  return (
    <Box flexDirection="column" height={terminalHeight}>
      <Box marginBottom={1}>
        <Text bold color="cyan">memoir</Text>
        <Text dimColor> — your lab notebook</Text>
      </Box>
      
      <Box flexDirection="column" flexGrow={1}>
        {state.view === 'results' ? (
          <SearchResults
            query={state.searchQuery}
            results={state.searchResults}
            selectedIndex={state.selectedResultIndex}
          />
        ) : (
          <Editor
            lines={state.editor.lines}
            cursorLine={state.editor.cursorLine}
            cursorCol={state.editor.cursorCol}
            scrollOffset={state.editor.scrollOffset}
            mode={state.mode}
            reservedLines={reservedLines}
          />
        )}
      </Box>
      
      {state.command.active && (
        <Box flexDirection="column">
          <Box>
            <Text bold>:</Text>
            <Text>{state.command.input}</Text>
            <Text backgroundColor="white" color="black"> </Text>
          </Box>
          {state.autocomplete.active && (
            <AutocompleteList
              candidates={state.autocomplete.candidates}
              selectedIndex={state.autocomplete.selectedIndex}
            />
          )}
        </Box>
      )}
      
      <StatusBar
        mode={state.mode}
        view={state.view}
        date={state.currentDate}
        dirty={state.dirty}
        message={state.message}
        lineCount={state.editor.lines.length}
        cursorLine={state.editor.cursorLine + 1}
        commandHint={state.command.hint}
      />
    </Box>
  );
}
