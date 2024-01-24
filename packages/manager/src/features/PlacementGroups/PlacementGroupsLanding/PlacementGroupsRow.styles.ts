import Warning from '@mui/icons-material/Warning';
import { styled } from '@mui/material/styles';

export const StyledWarningIcon = styled(Warning, {
  label: 'StyledWarningIcon',
})(({ theme }) => ({
  fill: theme.color.yellow,
  height: 16,
  marginRight: theme.spacing(),
  position: 'relative',
  top: 2,
  width: 16,
}));
