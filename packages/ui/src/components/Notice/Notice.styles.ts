import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  error: {
    borderLeft: `4px solid ${theme.tokens.component.NotificationBanner.Error.Border}`,
    background: theme.tokens.component.NotificationBanner.Error.Background,
    '& path': {
      fill: theme.tokens.component.NotificationBanner.Error.StatusIcon,
    },
  },
  icon: {
    '& g': {
      stroke: theme.tokens.color.Neutrals.White,
    },
    color: theme.tokens.color.Neutrals.White,
    width: 20,
    height: 20,
    position: 'relative',
  },
  info: {
    borderLeft: `4px solid ${theme.tokens.component.NotificationBanner.Informative.Border}`,
    background:
      theme.tokens.component.NotificationBanner.Informative.Background,
    '& path': {
      fill: theme.tokens.component.NotificationBanner.Informative.StatusIcon,
    },
  },
  root: {
    display: 'flex',
    alignItems: 'center',
    '& + .notice': {
      marginTop: `${theme.spacingFunction(8)} !important`,
    },
    borderRadius: 1,
    padding: `${theme.spacingFunction(8)} ${theme.spacingFunction(12)}`,
    '& .MuiTypography-root': {
      width: '100%',
    },
    '& p': {
      fontSize: theme.tokens.font.FontSize.Xs,
      font: theme.font.semibold,
      position: 'relative',
      top: 1,
      margin: 0,
    },
    maxWidth: '100%',
    position: 'relative',
  },
  success: {
    borderLeft: `4px solid ${theme.tokens.component.NotificationBanner.Success.Border}`,
    background: theme.tokens.component.NotificationBanner.Success.Background,
    '& path': {
      fill: theme.tokens.component.NotificationBanner.Success.StatusIcon,
    },
  },
  warning: {
    borderLeft: `4px solid ${theme.tokens.component.NotificationBanner.Warning.Border}`,
    background: theme.tokens.component.NotificationBanner.Warning.Background,
    // Only update outer triangle color
    '& .css-1j6o9qe-icon path:first-of-type': {
      fill: theme.tokens.component.NotificationBanner.Warning.StatusIcon,
    },
  },
}));
