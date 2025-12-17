#!/usr/bin/env node
// Memoir - Minimal TUI Notes App for Experiments & Thinking
// 
// Usage: mem [date]
//   - No arguments: Opens today's note
//   - With date: Opens note for that date (YYYY-MM-DD format)
//
// Two Modes:
//   NORMAL - Navigate, issue commands, read
//   INSERT - Write and edit text
//
// Commands (from Normal mode, prefix with :):
//   :next / :n      - Go to next day
//   :prev / :p      - Go to previous day
//   :today / :t     - Go to today
//   :search <query> - Search all notes
//   :write / :w     - Save note
//   :quit / :q      - Quit (auto-saves)
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
Memoir - Minimal TUI Notes App

Usage:
  mem            Open today's note
  mem YYYY-MM-DD Open note for specific date
  mem --dir      Show notes directory path
  mem --help     Show this help

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

