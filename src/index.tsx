#!/usr/bin/env node
// labbook - Minimal TUI Notes App for Experiments & Thinking
// 
// Usage: labbook [date]
//   - No arguments: Opens today's note
//   - With date: Opens note for that date (YYYY-MM-DD format)
//
// Keybindings:
//   Normal mode:
//     i       - Enter insert mode
//     /       - Search all notes
//     h/l     - Navigate to previous/next day
//     t       - Go to today
//     g       - Go to specific date
//     j/k     - Move cursor down/up
//     w       - Save note
//     q       - Quit (auto-saves)
//
//   Insert mode:
//     Esc     - Return to normal mode
//     Ctrl+S  - Save note
//
//   Search mode:
//     Enter   - Execute search
//     Esc     - Cancel
//
import React from 'react';
import { render } from 'ink';
import App from './app.js';
import { parseDate, getToday } from './lib/dates.js';
import { ensureNotesDir, getNotesDir } from './lib/storage.js';

// Ensure notes directory exists
ensureNotesDir();

// Parse command line args
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
labbook - Minimal TUI Notes App

Usage:
  labbook            Open today's note
  labbook YYYY-MM-DD Open note for specific date
  labbook --dir      Show notes directory path
  labbook --help     Show this help

Notes are stored in: ${getNotesDir()}
`);
  process.exit(0);
}

if (args.includes('--dir')) {
  console.log(getNotesDir());
  process.exit(0);
}

// Render the app
render(<App />);

