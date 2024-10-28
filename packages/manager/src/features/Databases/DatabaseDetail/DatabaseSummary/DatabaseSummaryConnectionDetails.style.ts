import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  actionBtnsCtn: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '10px',
    padding: `${theme.spacing(1)} 0`,
  },
  caCertBtn: {
    '& svg': {
      marginRight: theme.spacing(),
    },
    '&:hover': {
      backgroundColor: 'transparent',
      opacity: 0.7,
    },
    '&[disabled]': {
      '& g': {
        stroke: '#cdd0d5',
      },
      '&:hover': {
        backgroundColor: 'inherit',
        textDecoration: 'none',
      },
      // Override disabled background color defined for dark mode
      backgroundColor: 'transparent',
      color: '#cdd0d5',
      cursor: 'default',
    },
    color: theme.palette.primary.main,
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
    marginLeft: theme.spacing(),
    minHeight: 'auto',
    minWidth: 'auto',
    padding: 0,
  },
  connectionDetailsCtn: {
    '& p': {
      lineHeight: '1.5rem',
    },
    '& span': {
      fontFamily: theme.font.bold,
    },
    background: theme.interactionTokens.Background.Secondary,
    border: `1px solid ${theme.name === 'light' ? '#ccc' : '#222'}`,
    padding: `${theme.spacing(1)} 15px`,
  },
  copyToolTip: {
    '& svg': {
      color: theme.palette.primary.main,
      height: `${theme.spacing(2)} !important`,
      width: `${theme.spacing(2)} !important`,
    },
    marginRight: 12,
  },
  error: {
    color: theme.color.red,
    marginLeft: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  inlineCopyToolTip: {
    '& svg': {
      height: theme.spacing(2),
      width: theme.spacing(2),
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
    display: 'inline-flex',
    marginLeft: theme.spacing(0.5),
  },
  progressCtn: {
    '& circle': {
      stroke: theme.palette.primary.main,
    },
    alignSelf: 'flex-end',
    marginBottom: 2,
    marginLeft: 22,
  },
  provisioningText: {
    fontFamily: theme.font.normal,
    fontStyle: 'italic',
  },
  showBtn: {
    color: theme.palette.primary.main,
    fontSize: '0.875rem',
    marginLeft: theme.spacing(),
    minHeight: 'auto',
    minWidth: 'auto',
    padding: 0,
  },
}));
