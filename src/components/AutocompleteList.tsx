// Autocomplete list component
//
// Displays candidates below the command input
// with selection highlighting

import React from 'react';
import { Box, Text } from 'ink';

interface AutocompleteListProps {
  candidates: string[];
  selectedIndex: number;
  maxVisible?: number;
}

export function AutocompleteList({
  candidates,
  selectedIndex,
  maxVisible = 8,
}: AutocompleteListProps) {
  if (candidates.length === 0) {
    return null;
  }

  // Calculate visible window around selected item
  let startIndex = 0;
  if (candidates.length > maxVisible) {
    // Keep selected item in view, centered when possible
    const halfWindow = Math.floor(maxVisible / 2);
    startIndex = Math.max(0, selectedIndex - halfWindow);
    startIndex = Math.min(startIndex, candidates.length - maxVisible);
  }
  
  const visibleCandidates = candidates.slice(startIndex, startIndex + maxVisible);
  const showTopIndicator = startIndex > 0;
  const showBottomIndicator = startIndex + maxVisible < candidates.length;

  return (
    <Box flexDirection="column" marginLeft={1}>
      {showTopIndicator && (
        <Text dimColor>  ▲ more</Text>
      )}
      {visibleCandidates.map((candidate, i) => {
        const actualIndex = startIndex + i;
        const isSelected = actualIndex === selectedIndex;
        
        return (
          <Box key={actualIndex}>
            <Text color={isSelected ? 'cyan' : undefined}>
              {isSelected ? '▸ ' : '  '}
              {candidate}
            </Text>
          </Box>
        );
      })}
      {showBottomIndicator && (
        <Text dimColor>  ▼ more</Text>
      )}
    </Box>
  );
}
