import { Box, InputLabel } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

export type PathSampleProps = {
  className?: string;
  value: string;
};

export const PathSample = (props: PathSampleProps) => {
  const { className, value } = props;

  return (
    <Box className={className} display="flex" flexDirection="column">
      <InputLabel>Destination object name sample</InputLabel>
      <StyledValue>{value}</StyledValue>
    </Box>
  );
};

const StyledValue = styled('span', { label: 'StyledValue' })(({ theme }) => ({
  backgroundColor: theme.tokens.alias.Interaction.Background.Disabled,
  height: '34px',
  padding: theme.spacingFunction(8),
}));
