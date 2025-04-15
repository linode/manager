import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  error: {
    borderLeft: `4px solid ${theme.tokens.component.NotificationBanner.Error.Border}`,
    background: theme.tokens.component.NotificationBanner.Error.Background,
  },
  icon: {
    '& g': {
      stroke: theme.tokens.color.Neutrals.White,
    },
    color: theme.tokens.color.Neutrals.White,
    left: 10,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  important: {
    font: theme.font.normal,
    '& p': {
      paddingLeft: theme.spacingFunction(36),
    },
  },
  info: {
    borderLeft: `4px solid ${theme.tokens.component.NotificationBanner.Informative.Border}`,
    background:
      theme.tokens.component.NotificationBanner.Informative.Background,
  },
  root: {
    display: 'flex',
    '& + .notice': {
      marginTop: `${theme.spacingFunction(8)} !important`,
    },
    alignItems: 'center',
    borderRadius: 1,
    '& p': {
      fontSize: theme.tokens.font.FontSize.Xs,
      lineHeight: '20px',
      font: theme.font.semibold,
      padding: `10px ${theme.spacingFunction(16)}`,
    },
    maxWidth: '100%',
    padding: '0px',
    position: 'relative',
  },
  success: {
    borderLeft: `4px solid ${theme.tokens.component.NotificationBanner.Success.Border}`,
    background: theme.tokens.component.NotificationBanner.Success.Background,
  },
  warning: {
    borderLeft: `4px solid ${theme.tokens.component.NotificationBanner.Warning.Border}`,
    background: theme.tokens.component.NotificationBanner.Warning.Background,
  },
}));
