import { Button, TextField, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';

// sm = 600, md = 960, lg = 1280

const XS_TO_SM_BREAKPOINT = 450;

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  color: theme.textColors.headlineStatic,
  fontSize: theme.spacing(2),
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
  paddingLeft: 0,
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
    width: '568px',
  },
  [theme.breakpoints.down('sm')]: {
    margin: `${theme.spacing(1)} 0`,
    width: '100%',
  },
  [theme.breakpoints.down(XS_TO_SM_BREAKPOINT)]: {
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
    width: '568px',
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
  [theme.breakpoints.down(XS_TO_SM_BREAKPOINT)]: {
    marginTop: 0,
    minWidth: 'auto',
  },
  whiteSpace: 'nowrap',
}));

export const StyledReviewButton = styled(Button, {
  label: 'StyledReviewButton',
})(({ theme }) => ({
  marginLeft: theme.spacing(2),
  [theme.breakpoints.down(XS_TO_SM_BREAKPOINT)]: {
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
    width: '568px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));
