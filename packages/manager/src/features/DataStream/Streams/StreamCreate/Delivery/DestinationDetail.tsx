import { Box, Typography } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

type DestinationDetailProps = {
  label: string;
  value: string;
};

export const DestinationDetail = (props: DestinationDetailProps) => {
  const { label, value } = props;
  const theme = useTheme();

  return (
    <Box display="flex" marginTop={theme.spacingFunction(16)}>
      <StyledLabel>{label}:</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </Box>
  );
};

const StyledLabel = styled(Typography, {
  label: 'StyledLabel',
})(({ theme }) => ({
  font: theme.font.bold,
  width: 160,
}));

const StyledValue = styled(Box, {
  label: 'StyledValue',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.tokens.alias.Interaction.Background.Disabled,
  border: `1px solid ${theme.tokens.alias.Border.Neutral}`,
  borderRadius: 4,
  display: 'flex',
  height: theme.spacingFunction(24),
  padding: theme.spacingFunction(4, 8),
}));
