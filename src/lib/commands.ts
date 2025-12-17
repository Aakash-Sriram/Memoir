// Command parser and executor
//
// Design:
// - Commands are human-readable, verb-first
// - Aliases map to canonical commands
// - All commands are actions, not modes

export interface ParsedCommand {
  name: string;
  args: string[];
  raw: string;
}

export type CommandResult = 
  | { type: 'success'; message?: string }
  | { type: 'error'; message: string }
  | { type: 'navigation'; date: string }
  | { type: 'search'; query: string }
  | { type: 'goto'; heading: string }
  | { type: 'quit' }
  | { type: 'save' }
  | { type: 'help' };

// Alias map: shorthand → canonical command
const ALIASES: Record<string, string> = {
  // Navigation
  'n': 'next',
  'p': 'prev',
  'o': 'open',
  't': 'today',
  
  // Actions
  's': 'search',
  'w': 'write',
  'wq': 'wq',
  'q': 'quit',
  'q!': 'quit!',
  'g': 'goto',
  'h': 'help',
  '?': 'help',
};

// Parse command string into structured form
export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  const rawName = parts[0]?.toLowerCase() ?? '';
  const name = ALIASES[rawName] ?? rawName;
  const args = parts.slice(1);
  
  return { name, args, raw: trimmed };
}

// Execute a parsed command and return result
export function executeCommand(cmd: ParsedCommand): CommandResult {
  switch (cmd.name) {
    // Navigation commands
    case 'next':
      return { type: 'navigation', date: 'next' };
    
    case 'prev':
      return { type: 'navigation', date: 'prev' };
    
    case 'today':
      return { type: 'navigation', date: 'today' };
    
    case 'open': {
      const dateArg = cmd.args.join(' ').toLowerCase();
      if (!dateArg) {
        return { type: 'error', message: 'Usage: :open <date> (e.g., :open 2025-12-15 or :open yesterday)' };
      }
      return { type: 'navigation', date: dateArg };
    }
    
    // In-note navigation
    case 'goto': {
      const heading = cmd.args.join(' ');
      if (!heading) {
        return { type: 'error', message: 'Usage: :goto <heading> (e.g., :goto Experiments)' };
      }
      return { type: 'goto', heading };
    }
    
    // Search
    case 'search': {
      const query = cmd.args.join(' ');
      if (!query) {
        return { type: 'error', message: 'Usage: :search <query>' };
      }
      return { type: 'search', query };
    }
    
    // File operations
    case 'write':
    case 'save':
      return { type: 'save' };
    
    case 'quit':
      return { type: 'quit' };
    
    case 'quit!':
      return { type: 'quit' }; // Force quit, ignore dirty
    
    case 'wq': // Write and quit
      return { type: 'save' }; // App will handle quit after save
    
    // Help
    case 'help':
      return { type: 'help' };
    
    // Unknown command
    default:
      if (cmd.name) {
        return { type: 'error', message: `Unknown command: ${cmd.name}` };
      }
      return { type: 'success' }; // Empty command, just dismiss
  }
}

// Get list of available commands for help display
export function getCommandHelp(): string[] {
  return [
    ':next, :n          — Go to next day',
    ':prev, :p          — Go to previous day',
    ':today, :t         — Go to today',
    ':open <date>       — Open specific date (YYYY-MM-DD, yesterday, tomorrow)',
    ':goto <heading>    — Jump to heading in current note',
    ':search <query>, :s — Search all notes',
    ':write, :w         — Save current note',
    ':quit, :q          — Quit (auto-saves)',
    ':wq                — Save and quit',
    ':help, :?          — Show this help',
  ];
}
