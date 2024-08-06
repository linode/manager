import { styled } from '@mui/material/styles';

import Warning from 'src/assets/icons/warning.svg';
import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { omittedProps } from 'src/utilities/omittedProps';

import { Box } from '../Box';
import { Stack } from '../Stack';

export const StyledAkamaiLogo = styled(AkamaiLogo)(({ theme }) => ({
  '& .akamai-logo-icon': {
    fill: theme.color.white,
  },
  '& .akamai-logo-name': {
    display: 'none',
  },
}));

export const StyledWarningIcon = styled(Warning)(({ theme }) => ({
  color: theme.palette.warning.dark,
}));

export const StyledBanner = styled(Stack, {
  shouldForwardProp: omittedProps(['warning', 'margin']),
})<{ margin?: number; warning?: boolean }>(({ margin, theme, warning }) => ({
  backgroundColor: warning ? theme.palette.warning.light : theme.color.white,
  border: `1px solid ${
    warning ? theme.palette.warning.dark : theme.color.black
  }`,
  margin: `${theme.spacing(margin ?? 0)} 0`,
}));

export const StyledBannerLabel = styled(Box)(({ theme }) => ({
  backgroundColor: theme.color.black,
  padding: theme.spacing(2),
  textWrap: 'nowrap',
  userSelect: 'none',
}));

export const StyledBannerAction = styled(Box, {
  shouldForwardProp: omittedProps(['warning']),
})<{ warning?: boolean }>(({ theme, warning }) => ({
  color: warning ? theme.bg.mainContentBanner : theme.color.black,
  paddingRight: theme.spacing(2),
  textWrap: 'nowrap',
}));
