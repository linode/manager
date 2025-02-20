import { Box, Chip, Tooltip, Typography } from '@linode/ui';
import React from 'react';

import NullComponent from 'src/components/NullComponent';

export interface TextWithInfoProp {
  /**
   * The list of texts that needs to be displayed with chip and tooltip setup
   */
  values?: string[];
}

export const TextWithExtraInfo = ({ values }: TextWithInfoProp) => {
  if (!values?.length) {
    return <NullComponent />;
  }
  return (
    <Box alignItems="center" display="flex" gap={1}>
      <Chip
        sx={(theme) => ({
          backgroundColor: theme.color.tagButtonBg,
        })}
        label={values[0]}
      />
      {values.length > 1 && (
        <Tooltip
          title={
            <Box
              alignItems="center"
              display="flex"
              flexDirection="column"
              gap={1}
            >
              {values.map(
                (value, index) =>
                  index > 0 && (
                    <Typography key={index} variant="body2">
                      {value}
                    </Typography>
                  )
              )}
            </Box>
          }
        >
          <span>
            <Chip
              sx={(theme) => ({
                backgroundColor: theme.color.tagButtonBg,
              })}
              label={`+${values ? values.length - 1 : ''}`}
            />
          </span>
        </Tooltip>
      )}
    </Box>
  );
};
