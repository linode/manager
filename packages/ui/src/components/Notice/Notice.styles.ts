import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  error: {
    borderLeft: `5px solid ${theme.palette.error.dark}`,
  },
  icon: {
    '& g': {
      stroke: theme.tokens.color.Neutrals.White,
    },
    color: theme.tokens.color.Neutrals.White,
    left: -25,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  important: {
    backgroundColor: theme.palette.background.paper,
    borderLeftWidth: 32,
    font: theme.font.normal,
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  },
  info: {
    borderLeft: `5px solid ${theme.palette.info.dark}`,
  },
  noticeText: {
    font: theme.font.bold,
    fontSize: '1rem',
    lineHeight: '20px',
  },
  root: {
    '& + .notice': {
      marginTop: `${theme.spacing()} !important`,
    },
    alignItems: 'center',
    borderRadius: 1,
    fontSize: '1rem',
    maxWidth: '100%',
    padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
    position: 'relative',
  },
  success: {
    borderLeft: `5px solid ${theme.palette.success.dark}`,
  },
  warning: {
    borderLeft: `5px solid ${theme.palette.warning.dark}`,
  },
  warningIcon: {
    '& path:first-of-type': {
      stroke: theme.tokens.color.Neutrals[80],
    },
    color: theme.tokens.color.Neutrals[80],
  },
}));
