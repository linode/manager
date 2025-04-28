import * as React from 'react';

import { Box } from '../Box';
import { Typography } from '../Typography';

import type { SxProps } from '@mui/material';

interface Props {
  sx?: SxProps;
}

export const NotFound = (props: Props) => {
  return (
    <Box sx={props.sx}>
      <Typography>Not Found</Typography>
    </Box>
  );
};
