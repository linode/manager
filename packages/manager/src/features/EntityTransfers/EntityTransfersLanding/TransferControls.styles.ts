import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

// sm = 600, md = 960, lg = 1280

const xs_sm = 450;

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  color: theme.textColors.headlineStatic,
  fontSize: '1rem',
  marginRight: theme.spacing(),
  [theme.breakpoints.down('md')]: {
    flexBasis: '100%',
    marginBottom: theme.spacing(1),
  },
  whiteSpace: 'nowrap',
}));

export const StyledLabelWrapperGrid = styled(Grid, {
  label: 'StyledLabelWrapperGrid',
})(({ theme }) => ({
  margin: 0,
  [theme.breakpoints.down('lg')]: {
    flexWrap: 'wrap',
  },
  [theme.breakpoints.down('md')]: {
    '& > div': {
      margin: 0,
      padding: 0,
    },
    marginBottom: theme.spacing(1),
    padding: 0,
    width: 'calc(600px - 32px)',
  },
  [theme.breakpoints.down('sm')]: {
    margin: `${theme.spacing(1)} 0`,
    width: '100%',
  },
  [theme.breakpoints.down(xs_sm)]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
}));

export const StyledTransferGrid = styled(Grid, {
  label: 'StyledTransferGrid',
})(({ theme }) => ({
  paddingLeft: 0,
  paddingRight: 0,
  [theme.breakpoints.down('md')]: {
    width: 'calc(600px - 32px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: 0,
    width: '100%',
  },
}));

export const StyledTransferButton = styled(Button, {
  label: 'StyledTransferButton',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
  minWidth: 152,
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    margin: `${theme.spacing()} 0`,
  },
  [theme.breakpoints.down(xs_sm)]: {
    marginTop: 0,
    minWidth: 'auto',
  },
  whiteSpace: 'nowrap',
}));

export const StyledReviewButton = styled(Button, {
  label: 'StyledReviewButton',
})(({ theme }) => ({
  marginLeft: theme.spacing(2),
  [theme.breakpoints.down(xs_sm)]: {
    marginLeft: 0,
    marginTop: theme.spacing(),
    width: '100%',
  },
}));

export const StyledRootGrid = styled(Grid, {
  label: 'StyledRootGrid',
})(({ theme }) => ({
  margin: `${theme.spacing(2)} 0`,
  [theme.breakpoints.down('md')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    marginLeft: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    marginRight: theme.spacing(2),
  },
}));

export const StyledTextField = styled(TextField, {
  label: 'StyledTextField',
})(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    width: 240,
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
  width: 360,
}));

export const StyledTransferWrapperGrid = styled(Grid, {
  label: 'StyledTransferWrapperGrid',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    '& > div': {
      flexGrow: 1,
    },
    flexBasis: '100%',
    width: 'calc(600px-32px)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));
