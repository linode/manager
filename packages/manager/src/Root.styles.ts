import { makeStyles } from 'tss-react/mui';

import { SIDEBAR_WIDTH } from 'src/components/PrimaryNav/SideMenu';

import type { Theme } from '@mui/material/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  activationWrapper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up('xl')]: {
      margin: '0 auto',
      width: '50%',
    },
  },
  appFrame: {
    backgroundColor: theme.bg.app,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },
  bgStyling: {
    backgroundColor: theme.bg.main,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  cmrWrapper: {
    maxWidth: `${theme.breakpoints.values.lg}px !important`,
    padding: `${theme.spacing(3)} 0`,
    paddingTop: 12,
    [theme.breakpoints.between('md', 'xl')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: theme.spacing(2),
    },
    transition: theme.transitions.create('opacity'),
  },
  content: {
    flex: 1,
    [theme.breakpoints.up('md')]: {
      marginLeft: SIDEBAR_WIDTH,
    },
    transition: 'margin-left .1s linear',
  },
  fullWidthContent: {
    marginLeft: 0,
    [theme.breakpoints.up('md')]: {
      marginLeft: 52,
    },
  },
  grid: {
    marginLeft: 0,
    marginRight: 0,
    [theme.breakpoints.up('lg')]: {
      height: '100%',
    },
    width: '100%',
  },
  logo: {
    '& > g': {
      fill: theme.color.black,
    },
  },
  switchWrapper: {
    '& > .MuiGrid-container': {
      maxWidth: theme.breakpoints.values.lg,
      width: '100%',
    },
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%',
      },
    },
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
  },
}));
