// Search results component
import React from 'react';
import { Box, Text } from 'ink';
import { SearchMatch } from '../lib/storage.js';

interface SearchResultsProps {
  query: string;
  results: SearchMatch[];
  selectedIndex: number;
}

export function SearchResults({ query, results, selectedIndex }: SearchResultsProps) {
  if (!query) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text dimColor>Enter a search term...</Text>
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">No results for "{query}"</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text bold>
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </Text>
      </Box>
      
      {results.slice(0, 20).map((result, idx) => {
        const isSelected = idx === selectedIndex;
        const { date, line, content, matchStart, matchEnd } = result;
        
        // Truncate long lines
        const maxLen = 60;
        let displayContent = content;
        let displayMatchStart = matchStart;
        let displayMatchEnd = matchEnd;
        
        if (content.length > maxLen) {
          // Center the match in the visible portion
          const matchCenter = Math.floor((matchStart + matchEnd) / 2);
          const start = Math.max(0, matchCenter - Math.floor(maxLen / 2));
          displayContent = (start > 0 ? '...' : '') + content.slice(start, start + maxLen) + (start + maxLen < content.length ? '...' : '');
          displayMatchStart = matchStart - start + (start > 0 ? 3 : 0);
          displayMatchEnd = matchEnd - start + (start > 0 ? 3 : 0);
        }
        
        const before = displayContent.slice(0, Math.max(0, displayMatchStart));
        const match = displayContent.slice(Math.max(0, displayMatchStart), displayMatchEnd);
        const after = displayContent.slice(displayMatchEnd);
        
        return (
          <Box key={`${date}-${line}`} flexDirection="column">
            <Box>
              {isSelected && <Text color="cyan">❯ </Text>}
              {!isSelected && <Text>  </Text>}
              <Text color={isSelected ? 'cyan' : 'blue'} bold>{date}</Text>
              <Text dimColor> L{line}: </Text>
              <Text>
                {before}
                <Text backgroundColor="yellow" color="black">{match}</Text>
                {after}
              </Text>
            </Box>
          </Box>
        );
      })}
      
      {results.length > 20 && (
        <Box marginTop={1}>
          <Text dimColor>...and {results.length - 20} more results</Text>
        </Box>
      )}
    </Box>
  );
}
