import Grid from '@mui/material/Unstable_Grid2';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { styled } from '@mui/material/styles';

export const StyledResultsWrapper = styled('div', {
  label: 'StyledResultsWrapper',
})(({ theme }) => ({
  borderTop: '1px solid #D6D7D9',
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  marginTop: theme.spacing(3),
  marginLeft: theme.spacing(),
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
  marginLeft: theme.spacing(),
  '& p': {
    color: `${theme.textColors.tableStatic} !important`,
    fontSize: '0.875rem',
  },
}));

export const StyledImagesGridContainer = styled(Grid, {
  label: 'StyledImagesGridContainer',
})(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(),
  maxWidth: 850,
  '& svg': {
    height: 145,
    width: 145,
    [theme.breakpoints.only('sm')]: {
      height: 120,
      width: 120,
    },
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

export const StyledImageGrid = styled(Grid, {
  label: 'StyledImageGrid',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    color: theme.name === 'light' ? '#ededf4' : '#83868c',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

export const StyledImageCopy = styled(Typography, {
  label: 'StyledImageCopy',
})(({ theme }) => ({
  color: theme.textColors.headlineStatic,
  fontFamily: theme.font.bold,
  textAlign: 'center',
  marginTop: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    maxWidth: 216,
  },
}));
