import { Stack } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ShowMore } from 'src/components/ShowMore/ShowMore';

import { MAX_PORT_DISPLAY_CHARS } from '../constants';

interface PortsDisplayProps {
  ports: string[];
}

interface PortsPartition {
  displayText: string;
  hiddenPorts: string[];
}

/**
 * Calculates how many ports can be displayed within the character limit.
 * @param ports - Array of port strings to partition
 * @returns Object containing displayText and hiddenPorts
 */
const partitionPorts = (ports: string[]): PortsPartition => {
  if (ports.length === 0) {
    return { displayText: 'None', hiddenPorts: [] };
  }

  let accumulatedLength = 0;
  let visibleCount = 0;

  for (let i = 0; i < ports.length; i++) {
    const portLength = ports[i].length;
    const separatorLength = i < ports.length - 1 ? 2 : 0; // ', ' = 2 chars
    const totalLength = accumulatedLength + portLength + separatorLength;

    if (totalLength > MAX_PORT_DISPLAY_CHARS && accumulatedLength > 0) {
      break;
    }

    accumulatedLength = totalLength;
    visibleCount = i + 1;
  }

  const visiblePorts = ports.slice(0, visibleCount);
  const hiddenPorts = ports.slice(visibleCount);

  return {
    displayText: visiblePorts.join(', '),
    hiddenPorts,
  };
};

/**
 * Formats and displays ports with truncation when exceeding character limit.
 * React.memo ensures the component only re-renders when `ports` changes.
 * Hidden ports are accessible via ShowMore popover.
 */
export const PortsDisplay = React.memo(({ ports }: PortsDisplayProps) => {
  const theme = useTheme();
  const { displayText, hiddenPorts } = partitionPorts(ports);

  if (displayText === 'None') {
    return <span>None</span>;
  }

  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      <span>{displayText}</span>
      {hiddenPorts.length > 0 && (
        <ShowMore
          ariaItemType="ports"
          chipProps={{
            sx: {
              backgroundColor: theme.tokens.alias.Background.Neutralsubtle,
              color: theme.tokens.alias.Content.Text.Primary.Default,
              '&:hover, &:focus': {
                backgroundColor: theme.tokens.alias.Background.Neutralsubtle,
                color: theme.tokens.alias.Content.Text.Primary.Default,
              },
            },
          }}
          items={hiddenPorts}
          render={(hiddenPortsList) => (
            <Stack>
              {hiddenPortsList.map((port) => (
                <span key={port}>{port}</span>
              ))}
            </Stack>
          )}
        />
      )}
    </Stack>
  );
});

PortsDisplay.displayName = 'PortsDisplay';
