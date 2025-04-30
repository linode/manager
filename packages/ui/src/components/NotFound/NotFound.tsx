import * as React from 'react';

import ZeroState from '../../assets/icons/zero-state.svg';
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
        p: 8,
      }}
    >
      <ZeroState />
      <Typography variant="h2">Not Found</Typography>
      <Typography sx={{ mt: 1 }}>Something went wrong!</Typography>
    </Box>
  );
};
