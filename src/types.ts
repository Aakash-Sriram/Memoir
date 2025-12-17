// Core types for the notes app
// 
// Design contract:
// - Only two modes: Normal and Insert
// - Commands are invoked via : prefix, never change mode
// - Views may change (editor, results), modes do not

export type AppMode = 'normal' | 'insert';

// What the user is currently viewing
export type ViewType = 'editor' | 'results';

export interface Note {
  date: string;      // YYYY-MM-DD format
  content: string;   // Raw markdown content
  exists: boolean;   // Whether file exists on disk
}

export interface SearchResult {
  date: string;
  line: number;
  content: string;
  matchStart: number;
  matchEnd: number;
}

export interface EditorState {
  cursorLine: number;
  cursorCol: number;
  scrollOffset: number;
  lines: string[];
}

// Command system
export interface CommandState {
  active: boolean;       // Is command input visible?
  input: string;         // Current command text (without :)
  hint?: string;         // Subtle hint shown in status bar
}

export interface AppState {
  // Core state
  mode: AppMode;
  view: ViewType;
  currentDate: string;
  note: Note;
  editor: EditorState;
  
  // Command state (not a mode!)
  command: CommandState;
  
  // Search results (view, not mode)
  searchQuery: string;
  searchResults: SearchResult[];
  selectedResultIndex: number;
  
  // Feedback
  message: string;
  dirty: boolean;
}

// Default daily note template
export const DEFAULT_TEMPLATE = (date: string): string => `# ${date}

## Thoughts


## Experiments


## Learnings


## Quotes

`;

