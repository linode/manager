import { styled } from '@mui/material/styles';

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
  fontFamily: theme.font.bold,
  fontSize: '1rem',
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
