import { styled } from '@mui/material/styles';

import { StyledValueGrid } from '../DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

export const StyledConfigValue = styled(StyledValueGrid, {
  label: 'StyledValueGrid',
})(({ theme }) => ({
  padding: `${theme.tokens.spacing.S4} ${theme.tokens.spacing.S6}`,
}));

export const GroupHeader = styled('div')(({ theme }) => ({
  background: theme.tokens.alias.Background.Neutral,
  color:
    theme.palette.mode === 'dark'
      ? theme.tokens.color.Neutrals[5]
      : theme.tokens.color.Neutrals[100],
  font: theme.tokens.alias.Typography.Label.Bold.Xs,
  paddingBottom: theme.tokens.spacing.S8,
  paddingLeft: theme.tokens.spacing.S12,
  paddingRight: theme.tokens.spacing.S12,
  paddingTop: theme.tokens.spacing.S8,
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
    font: theme.tokens.alias.Typography.Label.Regular.Xs,
  },
  padding: 0,
}));
