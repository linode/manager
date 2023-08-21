import { styled } from '@mui/material/styles';

import { isPropValid } from 'src/utilities/isPropValid';

import { SearchSuggestionProps } from './SearchSuggestion';

export const StyledWrapperDiv = styled('div', {
  label: 'StyledWrapperDiv',
  shouldForwardProp: (prop) => isPropValid(['isFocused'], prop),
})<Partial<SearchSuggestionProps>>(({ isFocused, theme }) => ({
  '&:last-child': {
    borderBottom: 0,
  },
  alignItems: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
  width: 'calc(100% + 2px)',

  ...(isFocused && {
    '& .tag': {
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
      backgroundColor: theme.bg.lightBlue1,
      color: theme.palette.text.primary,
    },
    backgroundColor: `${theme.bg.main}`,
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
}));

export const StyledSuggestionTitle = styled('div', {
  label: 'StyledSuggestionTitle',
})(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '1rem',
  fontWeight: 600,
  wordBreak: 'break-all',
}));

export const StyledSegment = styled('span', {
  label: 'StyledSegment',
})(({ theme }) => ({
  color: theme.palette.primary.main,
}));

export const StyledSuggestionDescription = styled('div', {
  label: 'StyledSuggestionDescription',
})(({ theme }) => ({
  color: theme.color.headline,
  fontSize: '.75rem',
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
