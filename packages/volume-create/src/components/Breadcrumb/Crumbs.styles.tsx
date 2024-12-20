import { Typography } from '@linode/ui';
import { styled } from '@mui/material';

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({}) => ({
  '&:hover': {
    textDecoration: 'underline',
  },
  fontSize: '1.125rem',
  lineHeight: 'normal',
  textTransform: 'capitalize',
  whiteSpace: 'nowrap',
}));

export const StyledSlashTypography = styled(Typography, {
  label: 'StyledSlashTypography',
})(({ theme }) => ({
  color: theme.textColors.tableHeader,
  fontSize: 20,
  marginLeft: 2,
  marginRight: 2,
}));

export const StyledDiv = styled('div', { label: 'StyledDiv' })({
  alignItems: 'center',
  display: 'flex',
});
