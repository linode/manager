import { styled } from '@mui/material';

import { Typography } from 'src/components/Typography';

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  fontSize: '1.125rem',
  lineHeight: 'normal',
  textTransform: 'capitalize',
  whiteSpace: 'nowrap',
  '&:hover': {
    textDecoration: 'underline',
  },
  color: theme.textColors.tableHeader,
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
