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
                cursorCol={cursorCol}
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
  const afterCursor = line.slice(cursorCol);

  // Insert mode: show a thin caret (pipe) between characters
  return (
    <Text>
      {beforeCursor}
      <Text color="white" backgroundColor="black">|</Text>
      {afterCursor}
    </Text>
  );
}

interface StyledLineProps {
  line: string;
  isCurrentLine: boolean;
  cursorCol?: number;
}

function StyledLine({ line, isCurrentLine, cursorCol }: StyledLineProps) {
  // If current line in Normal mode and cursorCol is provided, split into before/at/after for block caret rendering
  if (isCurrentLine && typeof cursorCol === 'number') {
    const cursor = cursorCol ?? 0;
    const before = line.slice(0, cursorCol);
    const at = line[cursor] ?? ' ';
    const after = line.slice(cursor + 1);

    const renderWithStyle = (content: string, style: { bold?: boolean; color?: string } = {}) => {
      const { bold, color } = style;
      return (
        <Text bold={!!bold} color={color}>{content || ' '}</Text>
      );
    };

    // Determine heading style
    if (line.startsWith('# ')) {
      return (
        <Text>
          {renderWithStyle(before, { bold: true, color: 'cyan' })}
          <Text backgroundColor="white" color="black">{at}</Text>
          {renderWithStyle(after, { bold: true, color: 'cyan' })}
        </Text>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <Text>
          <Text bold color="blue">{before}</Text>
          <Text backgroundColor="white" color="black">{at}</Text>
          <Text bold color="blue">{after}</Text>
        </Text>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <Text>
          <Text bold color="magenta">{before}</Text>
          <Text backgroundColor="white" color="black">{at}</Text>
          <Text bold color="magenta">{after}</Text>
        </Text>
      );
    }
    if (line.startsWith('#### ')) {
      return (
        <Text>
          <Text bold color="yellow">{before}</Text>
          <Text backgroundColor="white" color="black">{at}</Text>
          <Text bold color="yellow">{after}</Text>
        </Text>
      );
    }
    if (line.startsWith('##### ') || line.startsWith('###### ')) {
      return (
        <Text>
          <Text bold color="green">{before}</Text>
          <Text backgroundColor="white" color="black">{at}</Text>
          <Text bold color="green">{after}</Text>
        </Text>
      );
    }

    // Default (non-heading) current line
    return (
      <Text>
        {before}
        <Text backgroundColor="white" color="black">{at}</Text>
        {after}
      </Text>
    );
  }

  // Non-current or non-normal-mode rendering (plain)
  if (line.startsWith('# ')) {
    return <Text bold color="cyan">{line || ' '}</Text>;
  }
  if (line.startsWith('## ')) {
    return <Text bold color="blue">{line || ' '}</Text>;
  }
  if (line.startsWith('### ')) {
    return <Text bold color="magenta">{line || ' '}</Text>;
  }
  if (line.startsWith('#### ')) {
    return <Text bold color="yellow">{line || ' '}</Text>;
  }
  if (line.startsWith('##### ') || line.startsWith('###### ')) {
    return <Text bold color="green">{line || ' '}</Text>;
  }

  return <Text>{line}</Text>;
}
