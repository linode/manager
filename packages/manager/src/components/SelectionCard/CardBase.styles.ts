import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import type { CardBaseProps } from './CardBase';

export const CardBaseGrid = styled(Grid, {
  label: 'CardBaseGrid',
})<Partial<CardBaseProps>>(({ theme, ...props }) => ({
  '&:before': {
    backgroundColor: 'transparent',
    content: '""',
    display: 'block',
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    transition: theme.transitions.create('backgroundColor'),
    width: 5,
  },
  '&:hover': {
    backgroundColor: props.checked ? theme.bg.lightBlue1 : theme.bg.main,
    borderColor: props.checked
      ? theme.palette.primary.main
      : theme.color.border2,
  },
  alignItems: 'center',
  backgroundColor: props.checked ? theme.bg.lightBlue1 : theme.bg.offWhite,
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
}));

export const CardBaseIcon = styled(Grid, {
  label: 'CardBaseIcon',
})(() => ({
  '& img': {
    maxHeight: 32,
    maxWidth: 32,
  },
  '& svg, & span': {
    color: '#939598',
    fontSize: 32,
  },
  alignItems: 'flex-end',
  display: 'flex',
  justifyContent: 'flex-end',
}));

export const CardBaseHeadings = styled(Grid, {
  label: 'CardBaseHeadings',
})(() => ({
  '& > div': {
    lineHeight: 1.3,
  },
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'space-around',
}));

export const CardBaseHeading = styled('div', {
  label: 'CardBaseHeading',
})(({ theme }) => ({
  alignItems: 'center',
  color: theme.color.headline,
  columnGap: theme.spacing(2),
  display: 'flex',
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  wordBreak: 'break-word',
}));

export const CardBaseSubheading = styled('div', {
  label: 'CardBaseSubheading',
})(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
}));
