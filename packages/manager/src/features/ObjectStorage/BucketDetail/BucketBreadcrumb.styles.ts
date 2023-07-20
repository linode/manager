import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Typography } from 'src/components/Typography';

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
  whiteSpace: 'nowrap',
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(1),
  },
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
  paddingTop: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  svg: {
    height: 16,
    width: 16,
  },
}));
