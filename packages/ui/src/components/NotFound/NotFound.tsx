import * as React from 'react';

import { Box } from '../Box';
import { Typography } from '../Typography';

import type { SxProps } from '@mui/material';

interface Props {
  alignTop?: boolean;
  sx?: SxProps;
}

export const NotFound = (props: Props) => {
  const { alignTop = false, ...rest } = props;

  return (
    <Box
      sx={{
        ...rest.sx,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: alignTop ? 'flex-start' : 'center',
        height: '100%',
      }}
    >
      <Typography>Not Found</Typography>
    </Box>
  );
};
