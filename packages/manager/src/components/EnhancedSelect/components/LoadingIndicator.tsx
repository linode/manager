import { CircleProgress } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

export const LoadingIndicator = () => {
  return <StyledCircleProgress data-testid="input-loading" size="sm" />;
};

const StyledCircleProgress = styled(CircleProgress)(() => ({
  position: 'relative',
  right: 20,
}));
