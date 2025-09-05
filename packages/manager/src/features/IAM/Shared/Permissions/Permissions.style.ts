import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledTitle = styled(Typography, { label: 'StyledTitle' })(
  ({ theme }) => ({
    font: theme.tokens.alias.Typography.Label.Bold.S,
    marginBottom: theme.tokens.spacing.S8,
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
