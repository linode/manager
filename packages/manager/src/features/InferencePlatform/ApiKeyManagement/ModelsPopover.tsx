import { Box, Typography } from '@linode/ui';
import Popover from '@mui/material/Popover';
import React, { useState } from 'react';

import { useInferencePlatform } from '../InferencePlatformContext';

interface ModelsPopoverProps {
  models: string[];
}

export const ModelsPopover = ({ models }: ModelsPopoverProps) => {
  const { models: allAvailableModels } = useInferencePlatform();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  // If no models specified or ['*'], it means all models are allowed
  const isAllModels =
    models.length === 0 || (models.length === 1 && models[0] === '*');
  const displayModels = isAllModels
    ? allAvailableModels.map((m) => m.id)
    : models;

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ display: 'inline-block' }}
    >
      <Typography
        sx={{
          color: 'text.primary',
          cursor: 'default',
          fontSize: 'inherit',
          textDecoration: 'underline',
        }}
      >
        {isAllModels
          ? 'All'
          : `${models.length} ${models.length === 1 ? 'Model' : 'Models'}`}
      </Typography>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        disableRestoreFocus
        onClose={handleMouseLeave}
        open={Boolean(anchorEl)}
        slotProps={{
          paper: {
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
          },
        }}
        sx={{ pointerEvents: 'none' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        <Box sx={{ minWidth: 180, p: 2, pointerEvents: 'auto' }}>
          {displayModels.length > 0 ? (
            displayModels.map((model) => (
              <Typography key={model} sx={{ py: 0.5 }}>
                {model}
              </Typography>
            ))
          ) : (
            <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              All available models
            </Typography>
          )}
        </Box>
      </Popover>
    </Box>
  );
};
