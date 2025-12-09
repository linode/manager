import { WarningIcon } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledWarningIcon = styled(WarningIcon, {
  label: 'StyledWarningIcon',
})(({ theme }) => ({
  fill: theme.color.yellow,
}));
