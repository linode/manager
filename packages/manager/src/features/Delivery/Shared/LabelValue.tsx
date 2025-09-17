import { Box, Typography } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

interface LabelValueProps {
  compact?: boolean;
  'data-testid'?: string;
  label: string;
  value: string;
}

export const LabelValue = (props: LabelValueProps) => {
  const { compact = false, label, value, 'data-testid': dataTestId } = props;
  const theme = useTheme();

  return (
    <Box
      alignItems="center"
      display="flex"
      marginTop={theme.spacingFunction(16)}
    >
      <Typography
        sx={{
          mr: 1,
          font: theme.font.bold,
          width: compact ? 'auto' : 160,
        }}
      >
        {label}:
      </Typography>
      <StyledValue data-testid={dataTestId}>{value}</StyledValue>
    </Box>
  );
};

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
