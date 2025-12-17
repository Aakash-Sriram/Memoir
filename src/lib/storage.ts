// Note storage - plain text files organized by date
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Note, DEFAULT_TEMPLATE } from '../types.js';

// Notes directory - stored in user's home folder
const NOTES_DIR = path.join(os.homedir(), '.labbook', 'notes');

// Ensure the notes directory exists
export function ensureNotesDir(): void {
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
  }
}

// Get the file path for a given date
export function getNotePath(date: string): string {
  return path.join(NOTES_DIR, `${date}.md`);
}

// Load a note for a specific date
export function loadNote(date: string): Note {
  ensureNotesDir();
  const filePath = getNotePath(date);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { date, content, exists: true };
  }
  
  // Return default template for new notes
  return {
    date,
    content: DEFAULT_TEMPLATE(date),
    exists: false
  };
}

// Save a note
export function saveNote(note: Note): void {
  ensureNotesDir();
  const filePath = getNotePath(note.date);
  fs.writeFileSync(filePath, note.content, 'utf-8');
}

// List all note dates (sorted newest first)
export function listNoteDates(): string[] {
  ensureNotesDir();
  
  try {
    const files = fs.readdirSync(NOTES_DIR);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''))
      .filter(f => /^\d{4}-\d{2}-\d{2}$/.test(f))
      .sort((a, b) => b.localeCompare(a));
  } catch {
    return [];
  }
}

// Full-text search across all notes
export interface SearchMatch {
  date: string;
  line: number;
  content: string;
  matchStart: number;
  matchEnd: number;
}

export function searchNotes(query: string): SearchMatch[] {
  if (!query.trim()) return [];
  
  const dates = listNoteDates();
  const results: SearchMatch[] = [];
  const lowerQuery = query.toLowerCase();
  
  for (const date of dates) {
    const note = loadNote(date);
    const lines = note.content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      const matchStart = lowerLine.indexOf(lowerQuery);
      
      if (matchStart !== -1) {
        results.push({
          date,
          line: i + 1,
          content: line,
          matchStart,
          matchEnd: matchStart + query.length
        });
      }
    }
  }
  
  return results;
}

// Get the notes directory path (for display)
export function getNotesDir(): string {
  return NOTES_DIR;
}
