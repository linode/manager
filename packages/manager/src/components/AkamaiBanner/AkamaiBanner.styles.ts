import { Box, omittedProps, Stack, WarningOutlinedIcon } from '@linode/ui';
import { styled } from '@mui/material/styles';

import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';

export const StyledAkamaiLogo = styled(AkamaiLogo, {
  label: 'StyledAkamaiLogo',
})(({ theme }) => ({
  '& .akamai-logo-icon': {
    fill: theme.tokens.color.Neutrals.White,
  },
  '& .akamai-logo-name': {
    display: 'none',
  },
}));

export const StyledWarningIcon = styled(WarningOutlinedIcon, {
  label: 'StyledWarningIcon',
})(({ theme }) => ({
  '& > path': {
    fill: theme.tokens.color.Neutrals.Black,
  },
}));

export const StyledBanner = styled(Stack, {
  label: 'StyledBanner',
  shouldForwardProp: omittedProps(['warning', 'margin']),
})<{ margin?: number; warning?: boolean }>(({ margin, theme, warning }) => ({
  backgroundColor: warning ? theme.palette.warning.light : theme.color.white,
  border: `${warning ? '3px' : '1px'} solid ${
    warning ? theme.palette.warning.dark : theme.color.black
  }`,
  margin: `${theme.spacing(margin ?? 0)} 0`,
}));

export const StyledBannerLabel = styled(Box, {
  label: 'StyledBannerLabel',
  shouldForwardProp: omittedProps(['warning']),
})<{ warning?: boolean }>(({ theme, warning }) => ({
  backgroundColor: warning
    ? theme.palette.warning.dark
    : theme.tokens.color.Neutrals.Black,
  color: warning
    ? theme.tokens.color.Neutrals.Black
    : theme.tokens.color.Neutrals.White,
  padding: theme.spacing(2.3),
  [theme.breakpoints.up('sm')]: {
    textWrap: 'nowrap',
  },
  userSelect: 'none',
}));

export const StyledBannerAction = styled(Box, {
  label: 'StyledBannerAction',
  shouldForwardProp: omittedProps(['warning']),
})<{ warning?: boolean }>(({ theme, warning }) => ({
  color: warning ? theme.bg.mainContentBanner : theme.color.black,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    paddingTop: 0,
  },
  [theme.breakpoints.up('sm')]: {
    paddingRight: theme.spacing(2),
    textWrap: 'nowrap',
  },
}));
