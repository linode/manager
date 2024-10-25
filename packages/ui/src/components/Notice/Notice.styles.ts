import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

export const useStyles = makeStyles<
  void,
  'error' | 'icon' | 'important' | 'noticeText'
>()((theme: Theme, _params, classes) => ({
  error: {
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
    borderLeft: `5px solid ${theme.palette.error.dark}`,
  },
  errorList: {
    borderLeft: `5px solid ${theme.palette.error.dark}`,
  },
  icon: {
    color: 'white',
    left: -25, // This value must be static regardless of theme selection
    position: 'absolute',
  },
  important: {
    '&.MuiGrid2-root': {
      padding: theme.spacing(1),
      paddingRight: 18,
    },
    [`& .${classes.noticeText}`]: {
      fontFamily: theme.font.normal,
    },
    backgroundColor: theme.bg.bgPaper,
  },
  info: {
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
    borderLeft: `5px solid ${theme.palette.info.dark}`,
  },
  infoList: {
    borderLeft: `5px solid ${theme.palette.info.dark}`,
  },
  inner: {
    width: '100%',
  },
  marketing: {
    borderLeft: `5px solid ${theme.color.green}`,
  },
  noticeText: {
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    lineHeight: '20px',
  },
  root: {
    '& + .notice': {
      marginTop: `${theme.spacing()} !important`,
    },
    [`& .${classes.error}`]: {
      borderLeftColor: theme.color.red,
    },
    alignItems: 'center',
    borderRadius: 1,
    display: 'flex',
    fontSize: '1rem',
    maxWidth: '100%',
    padding: '4px 16px',
    paddingRight: 18,
    position: 'relative',
  },
  success: {
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
    borderLeft: `5px solid ${theme.palette.success.dark}`,
  },
  successList: {
    borderLeft: `5px solid ${theme.palette.success.dark}`,
  },
  warning: {
    [`& .${classes.icon}`]: {
      color: '#555',
    },
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
    borderLeft: `5px solid ${theme.palette.warning.dark}`,
  },
  warningList: {
    borderLeft: `5px solid ${theme.palette.warning.dark}`,
  },
}));
