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
  background:
    theme.palette.mode === 'dark'
      ? theme.tokens.color.Neutrals[90]
      : theme.tokens.color.Neutrals[5],
  padding: theme.tokens.spacing.S8,
  width: '100%',
}));

export const StyledChip = styled(Chip, {
  label: 'StyledChip',
})(({ theme }) => ({
  backgroundColor: theme.tokens.color.Amber[5],
  color: theme.tokens.color.Orange[90],
  font: theme.tokens.typography.Heading.Overline,
  textTransform: theme.tokens.typography.Heading.OverlineTextCase,
}));
