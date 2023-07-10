import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import type { CardBaseProps } from './CardBase';

export const CardBaseGrid = styled(Grid, {
  label: 'CardBaseGrid',
})<Partial<CardBaseProps>>(({ theme, ...props }) => ({
  alignItems: 'center',
  backgroundColor: props.checked ? theme.bg.lightBlue2 : theme.bg.offWhite,
  border: `1px solid ${theme.bg.main}`,
  borderColor: props.checked ? theme.palette.primary.main : undefined,
  height: '100%',
  margin: 0,
  minHeight: 60,
  padding: `0 ${theme.spacing(1)} !important`,
  position: 'relative',
  transition:
    'background-color 225ms ease-in-out, border-color 225ms ease-in-out',
  width: '100%',

  '&:hover': {
    backgroundColor: props.checked ? theme.bg.lightBlue2 : theme.bg.main,
    borderColor: props.checked
      ? theme.palette.primary.main
      : theme.color.border2,
  },

  '&:before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 5,
    height: '100%',
    backgroundColor: 'transparent',
    transition: theme.transitions.create('backgroundColor'),
  },
}));

export const CardBaseIcon = styled(Grid, {
  label: 'CardBaseIcon',
})(() => ({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  '& svg, & span': {
    fontSize: 32,
    color: '#939598',
  },
  '& img': {
    maxHeight: 32,
    maxWidth: 32,
  },
}));

export const CardBaseHeadings = styled(Grid, {
  label: 'CardBaseHeadings',
})(() => ({
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'space-around',
  '& > div': {
    lineHeight: 1.3,
  },
}));

export const CardBaseHeading = styled('div', {
  label: 'CardBaseHeading',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  color: theme.color.headline,
  wordBreak: 'break-word',
  display: 'flex',
  alignItems: 'center',
  columnGap: theme.spacing(2),
}));

export const CardBaseSubheading = styled('div', {
  label: 'CardBaseSubheading',
})(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
}));
