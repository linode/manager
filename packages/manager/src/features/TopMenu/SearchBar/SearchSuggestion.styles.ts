import { styled } from '@mui/material/styles';

import { MenuItem } from 'src/components/MenuItem';

export const StyledSearchSuggestion = styled(MenuItem, {
  label: 'StyledSearchSuggestion',
})(({ theme }) => ({
  '&.MuiButtonBase-root.MuiMenuItem-root': {
    '&.Mui-focused, &:hover': {
      backgroundColor: `${theme.tokens.component.Dropdown.Background.Hover} !important`,
      color: theme.tokens.component.Dropdown.Text.Default,
    },
    background: theme.tokens.component.Dropdown.Background.Default,
    margin: '0 !important',
    padding: `${theme.spacing(0.25)} ${theme.spacing(1)} !important`,
  },
}));

export const StyledSuggestionIcon = styled('div', {
  label: 'StyledSuggestionIcon',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  marginLeft: theme.spacing(0.5),
  padding: theme.spacing(),
}));

export const StyledSuggestionTitle = styled('div', {
  label: 'StyledSuggestionTitle',
})(({ theme }) => ({
  color: theme.tokens.component.Dropdown.Text.Default,
  font: theme.tokens.alias.Typography.Label.Bold.S,
  wordBreak: 'break-all',
}));

export const StyledSuggestionDescription = styled('div', {
  label: 'StyledSuggestionDescription',
})(({ theme }) => ({
  color: theme.tokens.component.Dropdown.Text.Default,
  font: theme.tokens.alias.Typography.Label.Regular.Xs,
  overflowWrap: 'break-word',
  whiteSpace: 'normal',
  width: '100%',
  wordBreak: 'break-word',
}));

export const StyledSegment = styled('span', {
  label: 'StyledSegment',
})(({ theme }) => ({
  color: theme.tokens.component.Dropdown.Text.Default,
}));

export const StyledTagContainer = styled('div', {
  label: 'StyledTagContainer',
})(({ theme }) => ({
  '& .MuiButtonBase-root': {
    height: 22,
  },
  '& .MuiChip-label': {
    padding: '4px !important',
  },
  alignItems: 'center',
  display: 'flex',
  paddingRight: theme.spacing(2),
}));
