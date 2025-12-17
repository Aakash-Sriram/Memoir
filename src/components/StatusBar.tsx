// Status bar component - shows mode, date, and helpful hints
import React from 'react';
import { Box, Text } from 'ink';
import { AppMode } from '../types.js';
import { formatDateDisplay, isToday } from '../lib/dates.js';

interface StatusBarProps {
  mode: AppMode;
  date: string;
  dirty: boolean;
  message?: string;
  lineCount: number;
  cursorLine: number;
}

export function StatusBar({ mode, date, dirty, message, lineCount, cursorLine }: StatusBarProps) {
  const modeColors: Record<AppMode, string> = {
    normal: 'blue',
    insert: 'green',
    search: 'yellow',
    goto: 'magenta',
    results: 'cyan'
  };

  const modeLabels: Record<AppMode, string> = {
    normal: 'NORMAL',
    insert: 'INSERT',
    search: 'SEARCH',
    goto: 'GOTO',
    results: 'RESULTS'
  };

  const hints: Record<AppMode, string> = {
    normal: 'i:edit  /:search  g:goto  h/l:nav  q:quit',
    insert: 'Esc:done  Ctrl+S:save',
    search: 'Enter:search  Esc:cancel',
    goto: 'Enter:go  Esc:cancel',
    results: 'j/k:select  Enter:open  Esc:back'
  };

  const dateLabel = isToday(date) ? `${formatDateDisplay(date)} (today)` : formatDateDisplay(date);

  return (
    <Box flexDirection="column">
      {/* Main status line */}
      <Box>
        <Box marginRight={1}>
          <Text backgroundColor={modeColors[mode]} color="white" bold>
            {' '}{modeLabels[mode]}{' '}
          </Text>
        </Box>
        <Text>{dateLabel}</Text>
        {dirty && <Text color="yellow"> [modified]</Text>}
        <Box flexGrow={1} />
        <Text dimColor>L{cursorLine}/{lineCount}</Text>
      </Box>
      
      {/* Message or hints line */}
      <Box>
        {message ? (
          <Text color="yellow">{message}</Text>
        ) : (
          <Text dimColor>{hints[mode]}</Text>
        )}
      </Box>
    </Box>
  );
}
