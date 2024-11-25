import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

export const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})(() => ({
  alignItems: 'center',
  display: 'flex',
  position: 'relative',
}));

export const StyledPrefixWrapper = styled('div', {
  label: 'StyledPrefixWrapper',
})(({ theme }) => ({
  display: 'flex',
  overflow: 'auto',
  padding: `${theme.spacing(1)} ${theme.spacing(1)}`,
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(1),
  },
  whiteSpace: 'nowrap',
}));

export const StyledSlash = styled(Typography, {
  label: 'StyledSlash',
})(() => ({
  marginLeft: 4,
  marginRight: 4,
}));

export const StyledLink = styled(Typography, {
  label: 'StyledLink',
})(({ theme }) => ({
  '&:hover': {
    textDecoration: 'underline',
  },
  color: theme.textColors.linkActiveLight,
  cursor: 'pointer',
  fontSize: 16,
}));

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingTop: theme.spacing(1),
  svg: {
    height: 16,
    width: 16,
  },
}));
