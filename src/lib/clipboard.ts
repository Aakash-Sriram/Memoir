// Clipboard utilities
//
// Design:
// - Try system clipboard first (pbcopy/pbpaste, xclip, xsel)
// - Fall back to internal buffer silently
// - No error messages to user, just works

import { execSync } from 'child_process';

// Internal clipboard buffer as fallback
let internalClipboard = '';

/**
 * Copy text to clipboard
 * Tries system clipboard first, falls back to internal buffer
 */
export function copyToClipboard(text: string): void {
  internalClipboard = text;
  
  try {
    // Try different clipboard commands based on platform
    if (process.platform === 'darwin') {
      // macOS
      execSync('pbcopy', { input: text, encoding: 'utf-8' });
    } else if (process.platform === 'linux') {
      // Linux - try xclip first, then xsel
      try {
        execSync('xclip -selection clipboard', { input: text, encoding: 'utf-8' });
      } catch {
        try {
          execSync('xsel --clipboard --input', { input: text, encoding: 'utf-8' });
        } catch {
          // Fall back to internal clipboard (already set)
        }
      }
    } else if (process.platform === 'win32') {
      // Windows
      execSync('clip', { input: text, encoding: 'utf-8' });
    }
  } catch {
    // Silent fallback to internal clipboard (already set)
  }
}

/**
 * Paste text from clipboard
 * Tries system clipboard first, falls back to internal buffer
 */
export function pasteFromClipboard(): string {
  try {
    if (process.platform === 'darwin') {
      // macOS
      return execSync('pbpaste', { encoding: 'utf-8' });
    } else if (process.platform === 'linux') {
      // Linux - try xclip first, then xsel
      try {
        return execSync('xclip -selection clipboard -o', { encoding: 'utf-8' });
      } catch {
        try {
          return execSync('xsel --clipboard --output', { encoding: 'utf-8' });
        } catch {
          return internalClipboard;
        }
      }
    } else if (process.platform === 'win32') {
      // Windows - PowerShell Get-Clipboard
      return execSync('powershell -command "Get-Clipboard"', { encoding: 'utf-8' }).trim();
    }
  } catch {
    // Fall back to internal clipboard
  }
  
  return internalClipboard;
}

/**
 * Get internal clipboard contents (for testing or when system clipboard unavailable)
 */
export function getInternalClipboard(): string {
  return internalClipboard;
}

/**
 * Clear internal clipboard
 */
export function clearInternalClipboard(): void {
  internalClipboard = '';
}
