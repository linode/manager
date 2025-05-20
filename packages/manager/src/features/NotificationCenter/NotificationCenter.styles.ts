import { Box, omittedProps, Typography } from '@linode/ui';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { styled } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { Avatar } from 'src/components/Avatar/Avatar';
import { Link } from 'src/components/Link';

import type { NotificationCenterNotificationMessageProps } from './types';
import type { Theme } from '@mui/material/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  inverted: {
    transform: 'rotate(180deg)',
  },
  notificationSpacing: {
    '& > div:not(:first-of-type)': {
      margin: `${theme.spacing()} 0`,
      padding: '0 20px',
    },
    marginBottom: theme.spacing(2),
  },
  showMore: {
    '&:hover': {
      textDecoration: 'none',
    },
    alignItems: 'center',
    display: 'flex',
    font: theme.font.bold,
    fontSize: 14,
    paddingTop: theme.spacing(),
  },
}));

export const StyledLink = styled(Link)<
  Partial<NotificationCenterNotificationMessageProps>
>(({ theme, ...props }) => ({
  ...(props.notification?.severity === 'critical' && {
    '&:hover': {
      textDecoration: `${theme.color.red} underline`,
    },
    color: `${theme.color.red} !important`,
  }),
}));

export const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})(() => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
}));

export const StyledHeader = styled('div', {
  label: 'StyledHeader',
})(({ theme }) => ({
  alignItems: 'center',
  borderBottom: `solid 1px ${theme.borderColors.borderTable}`,
  display: 'flex',
  justifyContent: 'space-between',
  padding: `0 20px ${theme.spacing()}`,
}));

export const StyledLoadingContainer = styled('div', {
  label: 'StyledLoadingContainer',
})(() => ({
  display: 'flex',
  justifyContent: 'center',
}));

export const StyledLToggleContainer = styled(Box, {
  label: 'StyledLToggleButton',
})(({ theme }) => ({
  padding: `0 16px ${theme.spacing()}`,
}));

export const StyledNotificationCenterItem = styled(Box, {
  label: 'StyledNotificationCenterItem',
  shouldForwardProp: omittedProps(['header']),
})<{ header: string }>(({ theme, ...props }) => ({
  '& p': {
    lineHeight: '1.25rem',
  },
  display: 'flex',
  fontSize: '0.875rem',
  justifyContent: 'space-between',
  padding: props.header === 'Notifications' ? `${theme.spacing(1.5)} 20px` : 0,
  width: '100%',
}));

export const StyledCaret = styled(KeyboardArrowDown)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginLeft: theme.spacing(),
}));

export const StyledEmptyMessage = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  marginTop: theme.spacing(),
  padding: `0 20px`,
}));

export const NotificationEventStyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.bg.app,
  },
  color: theme.textColors.tableHeader,
  display: 'flex',
  gap: 16,
  paddingBottom: 12,
  paddingLeft: '20px',
  paddingRight: '20px',
  paddingTop: 12,
  width: '100%',
}));

export const NotificationEventAvatar = styled(Avatar, {
  label: 'StyledAvatar',
})(() => ({
  height: 32,
  marginTop: 2,
  minWidth: 32,
  width: 32,
}));

export const notificationEventStyles = makeStyles()((theme: Theme) => ({
  bar: {
    marginTop: theme.spacing(),
  },
  unseenEvent: {
    '&:after': {
      backgroundColor: theme.palette.primary.main,
      content: '""',
      display: 'block',
      height: '100%',
      left: 0,
      position: 'absolute',
      top: 0,
      width: 4,
    },
    backgroundColor: theme.bg.offWhite,
    borderBottom: `1px solid ${theme.bg.main}`,
    position: 'relative',
  },
}));
