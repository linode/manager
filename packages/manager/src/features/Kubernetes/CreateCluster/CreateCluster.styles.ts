import { Box, Stack } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledStackWithTabletBreakpoint = styled(Stack, {
  label: 'StyledStackWithTabletBreakpoint',
})(({ theme }) => ({
  flexDirection: 'row',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const StyledDocsLinkContainer = styled(Box, {
  label: 'StyledDocsLinkContainer',
})(({ theme }) => ({
  alignSelf: 'flex-start',
  marginLeft: 'auto',
  [theme.breakpoints.down('md')]: {
    marginLeft: 'unset',
    marginTop: theme.spacing(2),
  },
}));
