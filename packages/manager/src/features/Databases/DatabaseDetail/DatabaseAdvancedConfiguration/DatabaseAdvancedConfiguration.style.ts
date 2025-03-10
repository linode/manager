import { styled } from '@mui/material/styles';

import { StyledValueGrid } from '../DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

export const StyledConfigValue = styled(StyledValueGrid, {
  label: 'StyledValueGrid',
})(({ theme }) => ({
  padding: `${theme.tokens.spacing.S4} ${theme.tokens.spacing.S6}`,
}));

export const GroupHeader = styled('div')(({ theme }) => ({
  background:
    theme.palette.mode === 'dark'
      ? theme.tokens.color.Neutrals[90]
      : theme.tokens.color.Neutrals[5],
  color:
    theme.palette.mode === 'dark'
      ? theme.tokens.color.Neutrals[5]
      : theme.tokens.color.Neutrals[100],
  font: theme.tokens.typography.Label.Bold.Xs,
  padding: '8px 12px',
  position: 'sticky',
  textTransform: 'uppercase',
  top: 0,
  zIndex: 1,
}));
export const GroupItems = styled('ul')(({ theme }) => ({
  '& li': {
    color:
      theme.palette.mode === 'dark'
        ? theme.tokens.color.Neutrals[5]
        : theme.tokens.color.Neutrals[100],
    font: theme.tokens.typography.Label.Regular.Xs,
  },
  padding: 0,
}));
