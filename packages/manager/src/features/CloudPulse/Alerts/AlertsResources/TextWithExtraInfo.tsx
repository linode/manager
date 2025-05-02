import { Box, Chip, Tooltip, Typography } from '@linode/ui';
import React from 'react';

export interface TextWithInfoProp {
  /**
   * The list of texts that needs to be displayed with chip and tooltip setup
   */
  values?: string[];
}

export const TextWithExtraInfo = ({ values }: TextWithInfoProp) => {
  if (!values?.length) {
    return <Typography variant="body2">-</Typography>;
  }
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        gap: 1,
      }}
    >
      <Chip
        sx={(theme) => ({
          backgroundColor: theme.color.tagButtonBg,
          color: theme.color.tagButtonText,
        })}
        label={values[0]}
      />
      {values.length > 1 && (
        <Tooltip
          title={
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxHeight: '280px',
                overflow: 'auto',
              }}
            >
              {values.slice(1).map((value, index) => (
                <Typography key={index} variant="body2">
                  {value}
                </Typography>
              ))}
            </Box>
          }
        >
          <Box>
            <Chip
              sx={(theme) => ({
                backgroundColor: theme.color.tagButtonBg,
                color: theme.color.tagButtonText,
              })}
              label={`+${values.length - 1}`}
            />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};
