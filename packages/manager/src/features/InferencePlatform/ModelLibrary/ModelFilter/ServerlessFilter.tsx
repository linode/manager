import { Box, Typography } from '@linode/ui';
import React from 'react';

import Lightning from 'src/assets/icons/ai/lightning.svg';

import type { ModelFilterState } from '../modelLibrary.types';

interface ServerlessFilterProps {
  isServerless: boolean;
  onFilterChange: (next: Partial<ModelFilterState>) => void;
}

export const ServerlessFilter = ({
  isServerless,
  onFilterChange,
}: ServerlessFilterProps) => {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        height: 46,
      })}
    >
      <Typography
        sx={(theme) => ({
          color: theme.palette.text.primary,
          font: theme.font.bold,
          fontSize: 14,
        })}
      >
        is Serverless
      </Typography>

      <Box
        component="span"
        onClick={() => onFilterChange({ isServerless: !isServerless })}
        sx={(theme) => ({
          border: `1px solid ${isServerless ? theme.palette.grey[500] : theme.palette.grey[700]}`,
          backgroundColor: isServerless
            ? theme.palette.grey[900]
            : theme.palette.background.default,
          borderRadius: 2,
          height: 34,
          marginTop: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        })}
      >
        <Box
          component={Lightning}
          sx={(theme) => ({
            color: theme.palette.warning.dark,
            height: 15,
            width: 15,
            marginTop: -0.1,
            marginLeft: 1,
          })}
        />
        <Typography
          sx={(theme) => ({
            fontSize: 13,
            font: theme.font.semibold,
            paddingLeft: 1,
            paddingRight: 2,
            paddingTop: 1,
            paddingBottom: 0.9,
          })}
        >
          Serverless
        </Typography>
      </Box>
    </Box>
  );
};
