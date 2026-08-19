import { Font } from '@akamai/cds-tokens';
import { Box, List, ListItem, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

import type { Theme } from '@linode/ui';

export const panelSx = (theme: Theme) => ({
  width: { xs: 'calc(100vw - 40px)', sm: 558 },
  backgroundColor: theme.tokens.alias.Background.Normal,
  padding: `${theme.spacingFunction(24)} ${theme.spacingFunction(16)} ${theme.spacingFunction(16)}`,
  position: 'absolute',
  top: theme.spacingFunction(0),
  zIndex: theme.zIndex.modal,
  boxShadow: theme.tokens.alias.Elevation.L,
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.spacingFunction(16)} ${theme.spacingFunction(12)} ${theme.spacingFunction(12)}`,
    // cancels this panel's own mobile paddingTop, same technique as the base breakpoint
    top: '-16px',
  },
});

export const searchFieldContainerSx = (theme: Theme) => ({
  marginRight: `calc(-1 * ${theme.spacingFunction(16)})`,
  width: `calc(100% + ${theme.spacingFunction(16)} - 10px)`,
  '.MuiInputBase-root.MuiInput-root': {
    maxWidth: 'none',
    width: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    marginRight: `calc(-1 * ${theme.spacingFunction(12)})`,
    width: `calc(100% + ${theme.spacingFunction(12)} - 10px)`,
    '.MuiInputBase-root.MuiInput-root': {
      maxWidth: 'none',
      width: '100%',
    },
  },
});

export const closeTriggerButtonSx = (theme: Theme) => ({
  marginBottom: theme.spacingFunction(16),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacingFunction(12),
  },
});

export const StyledListbox = styled(List, {
  label: 'StyledListbox',
})(({ theme }) => ({
  listStyle: 'none',
  marginTop: theme.spacingFunction(16),
  maxHeight: 480,
  overflowY: 'auto',
  padding: 0,
  userSelect: 'none',
  marginRight: `calc(-1 * ${theme.spacingFunction(16)})`,
  width: `calc(100% + ${theme.spacingFunction(16)})`,
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.tokens.alias.Background.Neutralsubtle} ${theme.tokens.alias.Background.Neutral}`,
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.tokens.alias.Background.Neutral,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.tokens.alias.Background.Neutralsubtle,
  },
  [theme.breakpoints.down('sm')]: {
    marginRight: `calc(-1 * ${theme.spacingFunction(12)})`,
    width: `calc(100% + ${theme.spacingFunction(12)})`,
  },
}));

export const StyledGroupSection = styled(Box, {
  label: 'StyledGroupSection',
})(({ theme }) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  '&:not(:first-of-type)': {
    paddingTop: theme.spacingFunction(8),
  },
}));

export const StyledGroupHeader = styled(Box, {
  label: 'StyledGroupHeader',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.tokens.alias.Interaction.Background.Secondary,
  display: 'flex',
  gap: theme.spacingFunction(8),
  minHeight: theme.spacingFunction(32),
  padding: `0 ${theme.spacingFunction(4)}`,
}));

export const StyledGroupLabel = styled(Typography, {
  label: 'StyledGroupLabel',
})(({ theme }) => ({
  color: theme.tokens.alias.Content.Text.Primary.Default,
  font: theme.font.bold,
  fontSize: Font.FontSize.S,
  letterSpacing: '0%',
  lineHeight: Font.LineHeight.Xs,
}));

export const StyledOptionItem = styled(ListItem, {
  label: 'StyledOptionItem',
})(({ theme }) => ({
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  minHeight: theme.spacingFunction(32),
  padding: `0 ${theme.spacingFunction(12)} !important`,
  '&:hover': {
    backgroundColor: theme.tokens.alias.Interaction.Background.PrimaryHover,
    color: theme.tokens.component.Dropdown.Text.Default,
  },
  '&[aria-selected="true"]': {
    backgroundColor: `${theme.tokens.alias.Interaction.Background.PrimaryHover} !important`,
    color: theme.tokens.component.Dropdown.Text.Default,
  },
  '&[data-focus="true"]': {
    backgroundColor: `${theme.tokens.alias.Interaction.Background.PrimaryHover} !important`,
    color: theme.tokens.component.Dropdown.Text.Default,
  },
}));

export const StyledOptionLabel = styled(Typography, {
  label: 'StyledOptionLabel',
})(({ theme }) => ({
  font: theme.font.semibold,
  fontSize: Font.FontSize.Xs,
  letterSpacing: '0%',
  lineHeight: Font.LineHeight.Xxxs,
}));
