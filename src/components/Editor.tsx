// Editor component - displays and allows editing of note content
import React from 'react';
import { Box, Text, useStdout } from 'ink';
import { AppMode } from '../types.js';

interface EditorProps {
  lines: string[];
  cursorLine: number;
  cursorCol: number;
  scrollOffset: number;
  mode: AppMode;
  reservedLines?: number;  // Lines reserved for UI below editor
}

export function Editor({ 
  lines, 
  cursorLine, 
  cursorCol, 
  scrollOffset, 
  mode,
  reservedLines = 4 
}: EditorProps) {
  const { stdout } = useStdout();
  const terminalHeight = stdout?.rows ?? 24;
  
  // Calculate visible lines
  const editorHeight = Math.max(terminalHeight - reservedLines, 10);
  const visibleLines = lines.slice(scrollOffset, scrollOffset + editorHeight);
  
  return (
    <Box flexDirection="column" flexGrow={1}>
      {visibleLines.map((line, idx) => {
        const actualLineNum = scrollOffset + idx;
        const isCurrentLine = actualLineNum === cursorLine;
        const lineNumber = String(actualLineNum + 1).padStart(3, ' ');
        
        return (
          <Box key={actualLineNum}>
            {/* Line number */}
            <Text dimColor>{lineNumber} </Text>
            
            {/* Line content */}
            {mode === 'insert' && isCurrentLine ? (
              <EditableLine 
                line={line} 
                cursorCol={cursorCol} 
              />
            ) : (
              <StyledLine 
                line={line} 
                isCurrentLine={isCurrentLine && mode === 'normal'}
              />
            )}
          </Box>
        );
      })}
      
      {/* Fill remaining space */}
      {Array(Math.max(0, editorHeight - visibleLines.length))
        .fill(null)
        .map((_, idx) => (
          <Box key={`empty-${idx}`}>
            <Text dimColor>{'    ~'}</Text>
          </Box>
        ))}
    </Box>
  );
}

interface EditableLineProps {
  line: string;
  cursorCol: number;
}

function EditableLine({ line, cursorCol }: EditableLineProps) {
  const beforeCursor = line.slice(0, cursorCol);
  const atCursor = line[cursorCol] ?? ' ';
  const afterCursor = line.slice(cursorCol + 1);
  
  return (
    <Text>
      {beforeCursor}
      <Text backgroundColor="white" color="black">{atCursor}</Text>
      {afterCursor}
    </Text>
  );
}

interface StyledLineProps {
  line: string;
  isCurrentLine: boolean;
}

function StyledLine({ line, isCurrentLine }: StyledLineProps) {
  // Apply markdown-like styling
  if (line.startsWith('# ')) {
    return <Text bold color="cyan">{line}</Text>;
  }
  if (line.startsWith('## ')) {
    return <Text bold color="blue">{line}</Text>;
  }
  if (line.startsWith('### ')) {
    return <Text bold color="magenta">{line}</Text>;
  }
  
  // Highlight current line in normal mode
  if (isCurrentLine) {
    return <Text backgroundColor="gray">{line || ' '}</Text>;
  }
  
  return <Text>{line}</Text>;
}
