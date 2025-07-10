import { styled } from '@mui/material/styles';

import { omittedProps } from '../../utilities';
import { Box } from '../Box';

import type { NoticeVariant } from './Notice';

export const StyledNoticeBox = styled(Box, {
  label: 'StyledNotice',
  shouldForwardProp: omittedProps(['variant']),
})<{ variant: NoticeVariant }>(({ theme, variant }) => ({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
  '& + .notice': {
    marginTop: `${theme.spacingFunction(16)} !important`,
  },
  borderRadius: 1,
  padding: `10px ${theme.spacingFunction(12)}`,
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
  '& ul': {
    paddingLeft: 20,
    margin: 0,
    listStyleType: 'disc',
    '& li': {
      display: 'list-item',
      padding: 0,
    },
  },
  ...(variant === 'error' && {
    border: `1px solid ${theme.tokens.component.NotificationBanner.Error.Border}`,
    background: theme.tokens.component.NotificationBanner.Error.Background,
    '& path': {
      fill: theme.tokens.component.NotificationBanner.Error.StatusIcon,
    },
  }),
  ...(['info', 'tip'].includes(variant) && {
    border: `1px solid ${theme.tokens.component.NotificationBanner.Informative.Border}`,
    background:
      theme.tokens.component.NotificationBanner.Informative.Background,
    '& path': {
      fill: theme.tokens.component.NotificationBanner.Informative.StatusIcon,
    },
  }),
  ...(variant === 'success' && {
    border: `1px solid ${theme.tokens.component.NotificationBanner.Success.Border}`,
    background: theme.tokens.component.NotificationBanner.Success.Background,
    '& path': {
      fill: theme.tokens.component.NotificationBanner.Success.StatusIcon,
    },
  }),
  ...(variant === 'warning' && {
    border: `1px solid ${theme.tokens.component.NotificationBanner.Warning.Border}`,
    background: theme.tokens.component.NotificationBanner.Warning.Background,
    // Only update outer triangle color
    '& .css-1j6o9qe-icon path:first-of-type': {
      fill: theme.tokens.component.NotificationBanner.Warning.StatusIcon,
    },
  }),
  maxWidth: '100%',
  position: 'relative',
}));

export const StyledIconBox = styled(Box, {
  label: 'StyledIconBox',
})(() => ({
  display: 'flex',
  width: 20,
  height: 20,
  position: 'relative',
}));
