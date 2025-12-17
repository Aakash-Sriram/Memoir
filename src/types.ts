// Core types for the notes app

export type AppMode = 
  | 'normal'      // Command mode - navigate, search, etc.
  | 'insert'      // Editing note content
  | 'search'      // Search input active
  | 'goto'        // Date picker active
  | 'results';    // Search results view

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

export interface AppState {
  mode: AppMode;
  currentDate: string;
  note: Note;
  editor: EditorState;
  searchQuery: string;
  searchResults: SearchResult[];
  selectedResultIndex: number;
  gotoInput: string;
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
