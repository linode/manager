import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  error: {
    borderLeft: `5px solid ${theme.palette.error.dark}`,
  },
  icon: {
    color: theme.tokens.color.Neutrals.White,
    left: -25, // This value must be static regardless of theme selection
    position: 'absolute',
  },
  important: {
    backgroundColor: theme.palette.background.paper,
    borderLeftWidth: 32,
    fontFamily: theme.font.normal,
    padding: theme.spacing(1),
  },
  info: {
    borderLeft: `5px solid ${theme.palette.info.dark}`,
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
    alignItems: 'center',
    borderRadius: 1,
    display: 'flex',
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
    color: theme.tokens.color.Neutrals[80],
  },
}));
