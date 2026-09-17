import { Button } from '@akamai/cds-components/react';
import { useTheme } from '@linode/ui';
import React, { useContext } from 'react';

import './animations.css';
import { Box } from '../components';
import {
  ModelPlaygroundInputContext,
  ModelPlaygroundOutputContext,
} from './ModelPlaygroundContext';

export const ClearOutputButton = () => {
  const { isLoading, onClearMessages } = useContext(
    ModelPlaygroundInputContext
  );
  const { messages } = useContext(ModelPlaygroundOutputContext);
  const theme = useTheme();

  const visible = messages.length > 0;
  const bg =
    theme.palette.mode === 'light' ? theme.bg.white : theme.bg.offWhite;

  return (
    // A 0-height sticky element: takes no layout space but pins the button to
    // the top of the scroll viewport so it stays visible while scrolling, and
    // since it's inside the scroll box it respects the scrollbar width.
    <Box
      style={{
        height: 0,
        overflow: 'visible',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      <Box
        style={
          {
            animation: visible ? `fadeIn 0.3s ease forwards` : 'none',
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? 'auto' : 'none',
            position: 'absolute',
            right: 0,
            top: 0,
          } as React.CSSProperties
        }
      >
        <Button
          disabled={isLoading}
          onClick={onClearMessages}
          size="small"
          style={{ background: bg, borderRadius: '5px' }}
          variant="secondary"
        >
          Clear Context
        </Button>
      </Box>
    </Box>
  );
};
