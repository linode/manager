import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';

export const StyledResultsWrapper = styled('div', {
  label: 'StyledResultsWrapper',
})(({ theme }) => ({
  borderTop: '1px solid #D6D7D9',
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  marginLeft: theme.spacing(),
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(),
  width: 180,
}));

export const StyledReferralGrid = styled(Grid, {
  label: 'StyledReferralGrid',
})(({ theme }) => ({
  color: theme.textColors.headlineStatic,
}));

export const StyledEarnedGrid = styled(Grid, {
  label: 'StyledEarnedGrid',
})(({ theme }) => ({
  color: theme.color.green,
  fontFamily: theme.font.bold,
}));

export const StyledLimitNotice = styled(Notice, {
  label: 'StyledLimitNotice',
})(({ theme }) => ({
  '& p': {
    color: `${theme.textColors.tableStatic} !important`,
    fontSize: '0.875rem',
  },
  marginLeft: theme.spacing(),
}));

export const StyledImagesGridContainer = styled(Grid, {
  label: 'StyledImagesGridContainer',
})(({ theme }) => ({
  '& svg': {
    height: 145,
    [theme.breakpoints.only('sm')]: {
      height: 120,
      width: 120,
    },
    width: 145,
  },
  marginBottom: theme.spacing(),
  marginTop: theme.spacing(4),
  maxWidth: 850,
  [theme.breakpoints.down('sm')]: {
    alignItems: 'center',
    flexDirection: 'column',
  },
}));

export const StyledImageGrid = styled(Grid, {
  label: 'StyledImageGrid',
})(({ theme }) => ({
  '& svg': {
    color: theme.name === 'light' ? '#ededf4' : '#83868c',
  },
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

export const StyledImageCopy = styled(Typography, {
  label: 'StyledImageCopy',
})(({ theme }) => ({
  color: theme.textColors.headlineStatic,
  fontFamily: theme.font.bold,
  marginTop: theme.spacing(2),
  textAlign: 'center',
  [theme.breakpoints.up('sm')]: {
    maxWidth: 216,
  },
}));
