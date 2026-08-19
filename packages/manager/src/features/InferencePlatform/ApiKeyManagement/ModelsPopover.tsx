import { Popover } from '@akamai/cds-components/react/Popover';
import { Box, Typography } from '@linode/ui';
import React from 'react';

import { useInferencePlatform } from '../InferencePlatformContext';

interface ModelsPopoverProps {
  models: string[];
}

export const ModelsPopover = ({ models }: ModelsPopoverProps) => {
  const { models: allAvailableModels } = useInferencePlatform();

  // If no models specified or ['*'], it means all models are allowed
  const isAllModels =
    models.length === 0 || (models.length === 1 && models[0] === '*');
  const displayModels = isAllModels
    ? allAvailableModels.map((m) => m.id)
    : models;

  return (
    <Box sx={{ display: 'inline-block' }}>
      {/* cds-popover anchors to its previousElementSibling, so the trigger
          must be the element immediately before it. */}
      <Typography
        component="span"
        sx={{
          color: 'text.primary',
          cursor: 'pointer',
          fontSize: 'inherit',
          textDecoration: 'underline',
        }}
      >
        {isAllModels
          ? 'All'
          : `${models.length} ${models.length === 1 ? 'Model' : 'Models'}`}
      </Typography>
      <Popover
        placement="bottom-middle"
        showArrow
        style={
          {
            // .popover-content pads with this global token (24px by default),
            // which is far too much for a short list. Scoped to this popover.
            '--token-global-spacing-s24': '8px',
          } as React.CSSProperties
        }
        trigger="hover"
      >
        <Box
          sx={{
            // Slotted content stays in the light DOM, so it inherits the MUI
            // theme text colour (white in dark mode) and would vanish against
            // the dark bubble. Set it explicitly.
            display: 'flex',
            flexDirection: 'column',
            fontSize: '12px',
            gap: '4px',
            lineHeight: '16px',
          }}
        >
          {displayModels.length > 0
            ? displayModels.map((model) => <span key={model}>{model}</span>)
            : 'All available models'}
        </Box>
      </Popover>
    </Box>
  );
};
