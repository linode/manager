import { Button } from '@akamai/cds-components/react/Button';
import { Icon } from '@akamai/cds-components/react/Icon';
import { styled } from '@mui/material/styles';

export const StyledWrapper = styled('div', {
  label: 'StyledWrapper',
})(() => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  height: '20px',
}));

export const StyledToggleButton = styled(Button, {
  label: 'StyledToggleButton',
})(({ theme }) => ({
  marginLeft: theme.tokens.spacing.S8,
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
  display: 'flex',
}));

export const StyledIcon = styled(Icon, {
  label: 'StyledIcon',
})(({ theme }) => ({
  color: theme.palette.grey[500],
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));
