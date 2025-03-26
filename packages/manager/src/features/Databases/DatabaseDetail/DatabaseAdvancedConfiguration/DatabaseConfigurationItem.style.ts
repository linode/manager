import { Box, Chip } from '@linode/ui';
import { styled } from '@mui/material';

export const StyledWrapper = styled(Box, {
  label: 'StyledWrapper',
})(({ theme }) => ({
  marginBottom: theme.tokens.spacing.S12,
}));

export const StyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  background: theme.tokens.alias.Background.Neutral,
  padding: theme.tokens.spacing.S8,
  width: '100%',
}));

export const StyledChip = styled(Chip, {
  label: 'StyledChip',
})(({ theme }) => ({
  backgroundColor: theme.tokens.color.Amber[5],
  color: theme.tokens.alias.Accent.Warning.Primary,
  font: theme.tokens.alias.Typography.Heading.Overline,
  textTransform: theme.tokens.alias.Typography.Heading.OverlineTextCase,
}));
