// Labbook - Minimal TUI Notes App
import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, useApp, useStdout } from 'ink';
import TextInput from 'ink-text-input';
import { AppMode, AppState, EditorState, DEFAULT_TEMPLATE } from './types.js';
import { loadNote, saveNote, searchNotes, SearchMatch } from './lib/storage.js';
import { getToday, getYesterday, getTomorrow, parseDate, formatDateDisplay } from './lib/dates.js';
import { StatusBar } from './components/StatusBar.js';
import { Editor } from './components/Editor.js';
import { SearchResults } from './components/SearchResults.js';
import { useKeyboard } from './hooks/useKeyboard.js';

// Initialize state for a given date
function initState(date: string): AppState {
  const note = loadNote(date);
  const lines = note.content.split('\n');
  
  return {
    mode: 'normal',
    currentDate: date,
    note,
    editor: {
      cursorLine: 0,
      cursorCol: 0,
      scrollOffset: 0,
      lines
    },
    searchQuery: '',
    searchResults: [],
    selectedResultIndex: 0,
    gotoInput: '',
    message: '',
    dirty: false
  };
}

export default function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [state, setState] = useState<AppState>(() => initState(getToday()));
  
  const terminalHeight = stdout?.rows ?? 24;
  const editorHeight = Math.max(terminalHeight - 4, 10);
  
  // Navigate to a different date
  const navigateToDate = useCallback((date: string) => {
    // Save current note if dirty
    if (state.dirty) {
      const content = state.editor.lines.join('\n');
      saveNote({ ...state.note, content });
    }
    setState(initState(date));
  }, [state.dirty, state.editor.lines, state.note]);
  
  // Update cursor ensuring it stays in bounds
  const updateCursor = useCallback((line: number, col: number) => {
    setState(prev => {
      const maxLine = prev.editor.lines.length - 1;
      const newLine = Math.max(0, Math.min(line, maxLine));
      const lineContent = prev.editor.lines[newLine] ?? '';
      const maxCol = Math.max(0, lineContent.length - (prev.mode === 'normal' ? 1 : 0));
      const newCol = Math.max(0, Math.min(col, maxCol));
      
      // Adjust scroll to keep cursor visible
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
          scrollOffset: newScroll
        }
      };
    });
  }, [editorHeight]);
  
  // Keyboard handlers
  const handlers = {
    // Navigation
    onNavigateUp: () => updateCursor(state.editor.cursorLine - 1, state.editor.cursorCol),
    onNavigateDown: () => {
      if (state.mode === 'results') {
        setState(prev => ({
          ...prev,
          selectedResultIndex: Math.min(prev.selectedResultIndex + 1, prev.searchResults.length - 1)
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
    
    // Mode switching
    onEnterInsertMode: () => setState(prev => ({ ...prev, mode: 'insert', message: '' })),
    onEnterInsertModeEnd: () => {
      updateCursor(state.editor.cursorLine, state.editor.cursorCol + 1);
      setState(prev => ({ ...prev, mode: 'insert', message: '' }));
    },
    onEnterInsertModeNewLine: () => {
      setState(prev => {
        const newLines = [...prev.editor.lines];
        newLines.splice(prev.editor.cursorLine + 1, 0, '');
        return {
          ...prev,
          mode: 'insert',
          dirty: true,
          editor: {
            ...prev.editor,
            lines: newLines,
            cursorLine: prev.editor.cursorLine + 1,
            cursorCol: 0
          },
          message: ''
        };
      });
    },
    onEnterSearchMode: () => setState(prev => ({ 
      ...prev, 
      mode: 'search', 
      searchQuery: '',
      searchResults: [],
      message: '' 
    })),
    onEnterGotoMode: () => setState(prev => ({ 
      ...prev, 
      mode: 'goto', 
      gotoInput: '',
      message: '' 
    })),
    onExitMode: () => {
      if (state.mode === 'results') {
        setState(prev => ({ ...prev, mode: 'search' }));
      } else {
        setState(prev => ({ ...prev, mode: 'normal', message: '' }));
      }
    },
    
    // Date navigation
    onPrevDay: () => navigateToDate(getYesterday(state.currentDate)),
    onNextDay: () => navigateToDate(getTomorrow(state.currentDate)),
    onGoToToday: () => navigateToDate(getToday()),
    
    // Actions
    onSave: () => {
      const content = state.editor.lines.join('\n');
      saveNote({ ...state.note, content, exists: true });
      setState(prev => ({ 
        ...prev, 
        dirty: false, 
        note: { ...prev.note, content, exists: true },
        message: 'Saved!' 
      }));
      setTimeout(() => setState(prev => ({ ...prev, message: '' })), 2000);
    },
    
    onQuit: () => {
      if (state.dirty) {
        const content = state.editor.lines.join('\n');
        saveNote({ ...state.note, content });
      }
      exit();
    },
    
    onExecuteSearch: () => {
      if (state.searchQuery.trim()) {
        const results = searchNotes(state.searchQuery);
        setState(prev => ({
          ...prev,
          mode: 'results',
          searchResults: results,
          selectedResultIndex: 0
        }));
      }
    },
    
    onSelectResult: () => {
      if (state.mode === 'results' && state.searchResults.length > 0) {
        const result = state.searchResults[state.selectedResultIndex];
        navigateToDate(result.date);
        setTimeout(() => updateCursor(result.line - 1, 0), 50);
      } else if (state.mode === 'goto') {
        const parsed = parseDate(state.gotoInput);
        if (parsed) {
          navigateToDate(parsed);
        } else {
          setState(prev => ({ ...prev, mode: 'normal', message: 'Invalid date format' }));
        }
      }
    },
    
    onDeleteChar: () => {
      setState(prev => {
        const lines = [...prev.editor.lines];
        const line = lines[prev.editor.cursorLine];
        if (line && prev.editor.cursorCol < line.length) {
          lines[prev.editor.cursorLine] = 
            line.slice(0, prev.editor.cursorCol) + line.slice(prev.editor.cursorCol + 1);
          return {
            ...prev,
            dirty: true,
            editor: { ...prev.editor, lines }
          };
        }
        return prev;
      });
    },
    
    onDeleteCharBack: () => {
      setState(prev => {
        const lines = [...prev.editor.lines];
        const { cursorLine, cursorCol } = prev.editor;
        
        if (cursorCol > 0) {
          // Delete character before cursor
          const line = lines[cursorLine];
          lines[cursorLine] = line.slice(0, cursorCol - 1) + line.slice(cursorCol);
          return {
            ...prev,
            dirty: true,
            editor: {
              ...prev.editor,
              lines,
              cursorCol: cursorCol - 1
            }
          };
        } else if (cursorLine > 0) {
          // Join with previous line
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
              cursorCol: prevLine.length
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
        
        // Split line at cursor
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
            cursorCol: 0
          }
        };
      });
    },
    
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
            cursorCol: cursorCol + char.length
          }
        };
      });
    },
    
    onSearchInput: (char: string) => {
      if (char === '\b') {
        setState(prev => ({
          ...prev,
          searchQuery: prev.searchQuery.slice(0, -1)
        }));
      } else {
        setState(prev => ({
          ...prev,
          searchQuery: prev.searchQuery + char
        }));
      }
    },
    
    onGotoInput: (char: string) => {
      if (char === '\b') {
        setState(prev => ({
          ...prev,
          gotoInput: prev.gotoInput.slice(0, -1)
        }));
      } else {
        setState(prev => ({
          ...prev,
          gotoInput: prev.gotoInput + char
        }));
      }
    }
  };
  
  useKeyboard(state.mode, handlers);
  
  // Render based on mode
  const renderContent = () => {
    if (state.mode === 'search') {
      return (
        <Box flexDirection="column" flexGrow={1}>
          <Box marginBottom={1}>
            <Text bold>Search: </Text>
            <Text>{state.searchQuery}</Text>
            <Text backgroundColor="white" color="black"> </Text>
          </Box>
          <Text dimColor>Type your search and press Enter</Text>
        </Box>
      );
    }
    
    if (state.mode === 'results') {
      return (
        <SearchResults
          query={state.searchQuery}
          results={state.searchResults}
          selectedIndex={state.selectedResultIndex}
        />
      );
    }
    
    if (state.mode === 'goto') {
      return (
        <Box flexDirection="column" flexGrow={1}>
          <Box marginBottom={1}>
            <Text bold>Go to date: </Text>
            <Text>{state.gotoInput}</Text>
            <Text backgroundColor="white" color="black"> </Text>
          </Box>
          <Text dimColor>Format: YYYY-MM-DD (e.g., 2025-12-17)</Text>
        </Box>
      );
    }
    
    return (
      <Editor
        lines={state.editor.lines}
        cursorLine={state.editor.cursorLine}
        cursorCol={state.editor.cursorCol}
        scrollOffset={state.editor.scrollOffset}
        mode={state.mode}
      />
    );
  };
  
  return (
    <Box flexDirection="column" height={terminalHeight}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">labbook</Text>
        <Text dimColor> — your lab notebook</Text>
      </Box>
      
      {/* Main content */}
      <Box flexDirection="column" flexGrow={1}>
        {renderContent()}
      </Box>
      
      {/* Status bar */}
      <StatusBar
        mode={state.mode}
        date={state.currentDate}
        dirty={state.dirty}
        message={state.message}
        lineCount={state.editor.lines.length}
        cursorLine={state.editor.cursorLine + 1}
      />
    </Box>
  );
}
