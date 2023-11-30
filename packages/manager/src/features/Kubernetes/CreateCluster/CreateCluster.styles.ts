import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme: Theme) => ({
  inputWidth: {
    '& .react-select__menu': {
      maxWidth: 416,
    },
    maxWidth: 416,
  },
  regionSubtitle: {
    '& .MuiInput-root': {
      maxWidth: 416,
    },
    '& .react-select__menu': {
      maxWidth: 416,
    },
    '& p': {
      lineHeight: '1.43rem',
      margin: 0,
      maxWidth: '100%',
    },
  },
  root: {
    '& .mlMain': {
      flexBasis: '100%',
      maxWidth: '100%',
      [theme.breakpoints.up('lg')]: {
        flexBasis: '78.8%',
        maxWidth: '78.8%',
      },
    },
    '& .mlSidebar': {
      flexBasis: '100%',
      maxWidth: '100%',
      position: 'static',
      [theme.breakpoints.up('lg')]: {
        flexBasis: '21.2%',
        maxWidth: '21.2%',
        position: 'sticky',
      },
      width: '100%',
    },
  },
  sidebar: {
    background: 'none',
    marginTop: '0px !important',
    paddingTop: '0px !important',
    [theme.breakpoints.down('lg')]: {
      background: theme.color.white,
      marginTop: `${theme.spacing(3)} !important`,
      padding: `${theme.spacing(3)} !important`,
    },
    [theme.breakpoints.down('md')]: {
      padding: `${theme.spacing()} !important`,
    },
  },
}));
