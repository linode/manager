import { Box, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledTitle = styled(Typography, { label: 'StyledTitle' })(
  ({ theme }) => ({
    font: theme.tokens.alias.Typography.Label.Bold.S,
    marginBottom: theme.tokens.spacing.S4,
  })
);

export const StyledPermissionItem = styled(Typography, {
  label: 'StyledPermissionItem',
})(({ theme }) => ({
  borderRight: `1px solid ${theme.tokens.alias.Border.Normal}`,
  display: 'inline-block',
  padding: `0px ${theme.tokens.spacing.S6} ${theme.tokens.spacing.S2}`,
}));

export const StyledContainer = styled('div', {
  label: 'StyledContainer',
})(() => ({
  marginLeft: -6,
  position: 'relative',
}));

export const StyledClampedContent = styled('div', {
  label: 'StyledClampedContent',
})<{ showAll?: boolean }>(({ showAll }) => ({
  '& p:last-child': {
    borderRight: 0,
  },
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: showAll ? 'unset' : 2,
  display: '-webkit-box',
  overflow: 'hidden',
}));

export const StyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  font: theme.tokens.alias.Typography.Label.Semibold.Xs,
  paddingLeft: theme.tokens.spacing.S6,
}));
