import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import type { SearchSuggestionProps } from './SearchSuggestion';

export const StyledWrapperDiv = styled('div', {
  label: 'StyledWrapperDiv',
  shouldForwardProp: omittedProps(['isFocused']),
})<Partial<SearchSuggestionProps>>(({ isFocused, theme }) => ({
  '&:last-child': {
    borderBottom: 0,
  },
  alignItems: 'space-between',
  background: theme.tokens.dropdown.Background.Default,
  cursor: 'pointer',
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
  ...(isFocused && {
    backgroundColor: theme.tokens.dropdown.Background.Hover,
  }),
}));

export const StyledSuggestionIcon = styled('div', {
  label: 'StyledSuggestionIcon',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  marginLeft: theme.spacing(1.5),
  padding: theme.spacing(),
  svg: {
    color: theme.tokens.dropdown.Text.Default,
  },
}));

export const StyledSuggestionTitle = styled('div', {
  label: 'StyledSuggestionTitle',
})(({ theme }) => ({
  color: theme.tokens.dropdown.Text.Default,
  font: theme.tokens.typography.Label.Bold.S,
  wordBreak: 'break-all',
}));

export const StyledSegment = styled('span', {
  label: 'StyledSegment',
})(({ theme }) => ({
  color: theme.tokens.dropdown.Text.Default,
}));

export const StyledSuggestionDescription = styled('div', {
  label: 'StyledSuggestionDescription',
})(({ theme }) => ({
  color: theme.tokens.dropdown.Text.Default,
  font: theme.tokens.typography.Label.Regular.Xs,
  marginTop: 2,
}));

export const StyledTagContainer = styled('div', {
  label: 'StyledTagContainer',
})(() => ({
  '& > div': {
    margin: '2px',
  },
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  paddingRight: 8,
}));
