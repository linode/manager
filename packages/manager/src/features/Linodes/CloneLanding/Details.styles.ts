import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledButton = styled('button', { label: 'StyledButton' })(
  ({ theme }) => ({
    '& path': {
      fill: theme.palette.primary.main,
    },
    alignItems: 'center',
    backgroundColor: theme.color.white,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    paddingBottom: 0,
    paddingTop: 0,
  })
);

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  '& a': {
    color: theme.color.red,
    textDecoration: 'underline',
  },
  color: theme.color.red,
  marginTop: theme.spacing(1),
}));

export const StyledHeader = styled('header', { label: 'StyledHeader' })(
  ({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  })
);

export const StyledDiv = styled('div', { label: 'StyledDiv' })({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
});
