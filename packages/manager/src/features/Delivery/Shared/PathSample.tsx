import { Box, InputLabel } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

interface PathSampleProps {
  value: string;
}

export const PathSample = (props: PathSampleProps) => {
  const { value } = props;

  return (
    <Box display="flex" flexDirection="column">
      <InputLabel>Destination object name sample</InputLabel>
      <StyledValue>{value}</StyledValue>
    </Box>
  );
};

const StyledValue = styled('span', { label: 'StyledValue' })(({ theme }) => ({
  backgroundColor: theme.tokens.alias.Interaction.Background.Disabled,
  height: 34,
  width: theme.inputMaxWidth,
  padding: theme.spacingFunction(8),
}));
