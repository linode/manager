import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';

export const LoadingIndicator = () => {
  return <StyledCircleProgress data-testid="input-loading" size={20} />;
};

const StyledCircleProgress = styled(CircleProgress)(() => ({
  position: 'relative',
  right: 20,
}));
