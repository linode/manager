import { styled } from '@mui/material/styles';
import * as React from 'react';

import CircularProgress from 'src/components/core/CircularProgress';

export const LoadingIndicator = () => {
  return <StyledCircularProgress data-testid="input-loading" size={20} />;
};

const StyledCircularProgress = styled(CircularProgress)(() => ({
  position: 'relative',
  right: 20,
}));
