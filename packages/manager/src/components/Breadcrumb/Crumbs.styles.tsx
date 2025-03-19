import { Typography } from '@linode/ui';
import { styled } from '@mui/material';

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  '&:hover': {
    textDecoration: 'underline',
  },
  fontSize: '1rem',
  lineHeight: 'normal',
  textTransform: 'capitalize',
  whiteSpace: 'nowrap',
  color: theme.tokens.component.Breadcrumb.LastItem.Text,
}));

export const StyledSlashTypography = styled(Typography, {
  label: 'StyledSlashTypography',
})(({ theme }) => ({
  color: theme.textColors.tableHeader,
  fontSize: 16,
  marginLeft: 4,
  marginRight: 4,
}));

export const StyledDiv = styled('div', { label: 'StyledDiv' })({
  alignItems: 'center',
  display: 'flex',
});
