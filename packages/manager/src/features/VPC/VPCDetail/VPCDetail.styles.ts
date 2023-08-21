import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Paper } from 'src/components/Paper';

export const StyledActionButton = styled(Button, {
  label: 'StyledActionButton',
})(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.color.blueDTwhite,
    color: theme.color.white,
  },
  color: theme.textColors.linkActiveLight,
  fontFamily: theme.font.normal,
  fontSize: '0.875rem',
  height: theme.spacing(5),
  minWidth: 'auto',
}));

export const StyledDescriptionBox = styled(Box, {
  label: 'StyledDescriptionBox',
})(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(1),
  },
}));

export const StyledSummaryBox = styled(Box, {
  label: 'StyledSummaryBox',
})(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

export const StyledSummaryTextTypography = styled(Typography, {
  label: 'StyledSummaryTextTypography',
})(({ theme }) => ({
  '& strong': {
    paddingRight: theme.spacing(1),
  },
  '&:first-of-type': {
    paddingBottom: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    paddingBottom: theme.spacing(2),
  },
  whiteSpace: 'nowrap',
}));

export const StyledPaper = styled(Paper, {
  label: 'StyledPaper',
})(({ theme }) => ({
  borderTop: `1px solid ${theme.borderColors.borderTable}`,
  display: 'flex',
  padding: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
  },
}));
