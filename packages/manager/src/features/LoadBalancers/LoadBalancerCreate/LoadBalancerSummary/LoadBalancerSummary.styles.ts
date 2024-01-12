import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';
import { Paper } from 'src/components/Paper';

export const EditActionButton = styled(Button)(({ theme }) => ({
  '&:hover, &:focus': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    textDecoration: 'underline',
  },
  color: theme.textColors.linkActiveLight,
  fontFamily: theme.font.bold,
  fontSize: '.875rem',
  minHeight: 'unset',
  minWidth: 'auto',
  padding: 0,
  position: 'absolute',
  right: theme.spacing(3),
}));

export const StyledPaper = styled(Paper, { label: 'StyledPaper' })(() => ({
  position: 'relative',
}));

export const StyledMainGridItem = styled(Grid, {
  label: 'StyledMainGridItem',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    order: 1,
  },
}));

export const StyledSidebarGridItem = styled(Grid, {
  label: 'StyledSidebarGridItem',
})(({ theme }) => ({
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(1),
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    order: 2,
  },
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: 18,
  [theme.breakpoints.up('lg')]: {
    width: '100%',
  },
}));
