import { Button } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledTriggerButton = styled(Button, {
  label: 'StyledTriggerButton',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: 'transparent',
  display: 'flex',
  gap: theme.spacingFunction(4),
  justifyContent: 'flex-start',
  minWidth: 'auto',
  padding: 0,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'transparent',
  },
}));
