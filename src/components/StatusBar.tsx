// Status bar component
//
// Design contract:
// - Only shows NORMAL or INSERT (two modes, ever)
// - May show subtle hint for active command/view
// - Commands don't change mode display

import React from 'react';
import { Box, Text } from 'ink';
import { AppMode, ViewType } from '../types.js';
import { formatDateDisplay, isToday } from '../lib/dates.js';

interface StatusBarProps {
  mode: AppMode;
  view: ViewType;
  date: string;
  dirty: boolean;
  message?: string;
  lineCount: number;
  cursorLine: number;
  commandHint?: string;  // e.g., "search", "results"
}

export function StatusBar({ 
  mode, 
  view, 
  date, 
  dirty, 
  message, 
  lineCount, 
  cursorLine,
  commandHint 
}: StatusBarProps) {
  const modeColor = mode === 'insert' ? 'green' : 'blue';
  const modeLabel = mode === 'insert' ? 'INSERT' : 'NORMAL';
  
  const dateLabel = isToday(date) 
    ? `${formatDateDisplay(date)} (today)` 
    : formatDateDisplay(date);

  // Build hint text
  let hint = '';
  if (mode === 'normal') {
    if (view === 'results') {
      hint = 'j/k:navigate  Enter:open  Esc:back  :command';
    } else {
      hint = 'i:edit  :command  /:search  h/l:days';
    }
  } else {
    hint = 'Esc:done  Ctrl+S:save';
  }

  return (
    <Box flexDirection="column">
      {/* Main status line */}
      <Box>
        <Box marginRight={1}>
          <Text backgroundColor={modeColor} color="white" bold>
            {' '}{modeLabel}{' '}
          </Text>
        </Box>
        
        {/* Optional command hint */}
        {commandHint && (
          <Text dimColor>— {commandHint}  </Text>
        )}
        
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
          <Text dimColor>{hint}</Text>
        )}
      </Box>
    </Box>
  );
}
