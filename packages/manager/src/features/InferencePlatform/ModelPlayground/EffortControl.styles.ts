import { styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  border: 'none',
  borderRadius: '5px !important',
  backgroundColor:
    theme.palette.mode === 'dark'
      ? theme.tokens.component.TextField.Default.Background
      : theme.bg.offWhite,
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
  padding: theme.spacingFunction(4, 8),
  textTransform: 'none',
  '&.Mui-selected': {
    backgroundColor: theme.tokens.color.Ultramarine[70],
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.tokens.color.Ultramarine[70],
      color: theme.palette.common.white,
    },
  },
  '&:hover':
    theme.palette.mode === 'light'
      ? { backgroundColor: theme.bg.tableHeader }
      : {},
}));
