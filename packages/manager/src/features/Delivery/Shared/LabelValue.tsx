import { Box, Tooltip, Typography } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

interface LabelValueProps {
  children?: React.ReactNode;
  compact?: boolean;
  'data-testid'?: string;
  label: string;
  smHideTooltip?: boolean;
  value: string;
}

export const LabelValue = (props: LabelValueProps) => {
  const {
    compact = false,
    label,
    value,
    'data-testid': dataTestId,
    children,
    smHideTooltip,
  } = props;
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

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
      <StyledValue
        data-testid={dataTestId}
        title={!smHideTooltip && matchesSmDown ? value : undefined}
      >
        <Typography>{value}</Typography>
      </StyledValue>
      {children}
    </Box>
  );
};

const StyledValue = styled(Tooltip, {
  label: 'StyledValue',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.tokens.alias.Interaction.Background.Disabled,
  border: `1px solid ${theme.tokens.alias.Border.Neutral}`,
  borderRadius: 4,
  display: 'flex',
  height: theme.spacingFunction(24),
  padding: theme.spacingFunction(4, 8),
  [theme.breakpoints.down('sm')]: {
    display: 'block',
    maxWidth: '174px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    padding: theme.spacingFunction(1, 8),
  },
}));
