import { styled } from '@mui/material/styles';

import { Typography } from 'src/components/Typography';

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  '& a': {
    color: theme.textColors.linkActiveLight,
  },
  '& a:hover': {
    color: '#3683dc',
  },
  '& p': {
    fontFamily: '"LatoWebBold", sans-serif',
  },
  fontSize: '0.9em',
}));
