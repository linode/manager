import { styled } from '@mui/material/styles';

import Warning from 'src/assets/icons/warning.svg';
import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { omittedProps } from 'src/utilities/omittedProps';

import { Box } from '../Box';
import { Stack } from '../Stack';

export const StyledAkamaiLogo = styled(AkamaiLogo)({
  '& .akamai-logo-icon': {
    fill: 'white',
  },
  '& .akamai-logo-name': {
    display: 'none',
  },
});

export const StyledWarningIcon = styled(Warning)({
  color: 'black',
});

export const StyledBanner = styled(Stack, {
  shouldForwardProp: omittedProps(['warning', 'margin']),
})<{ margin?: number; warning?: boolean }>(({ margin, theme, warning }) => ({
  backgroundColor: warning ? theme.palette.warning.light : theme.color.white,
  border: `${warning ? '3px' : '1px'} solid ${
    warning ? theme.palette.warning.dark : theme.color.black
  }`,
  margin: `${theme.spacing(margin ?? 0)} 0`,
}));

export const StyledBannerLabel = styled(Box, {
  shouldForwardProp: omittedProps(['warning']),
})<{ warning?: boolean }>(({ theme, warning }) => ({
  backgroundColor: warning ? theme.palette.warning.dark : 'black',
  color: warning ? 'black' : 'white',
  padding: theme.spacing(2.3),
  [theme.breakpoints.up('sm')]: {
    textWrap: 'nowrap',
  },
  userSelect: 'none',
}));

export const StyledBannerAction = styled(Box, {
  shouldForwardProp: omittedProps(['warning']),
})<{ warning?: boolean }>(({ theme, warning }) => ({
  color: warning ? theme.bg.mainContentBanner : theme.color.black,
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    textWrap: 'nowrap',
  },
}));
