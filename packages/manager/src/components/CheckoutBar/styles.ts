import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';

import { Button } from 'src/components/Button/Button';

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: 18,
  [theme.breakpoints.up('lg')]: {
    width: '100%',
  },
}));

const StyledRoot = styled('div')(() => {
  const theme = useTheme();

  return {
    minHeight: '24px',
    minWidth: '24px',
    [theme.breakpoints.down('md')]: {
      background: theme.color.white,
      bottom: '0 !important' as '0',
      left: '0 !important' as '0',
      padding: theme.spacing(2),
      position: 'relative !important' as 'relative',
    },
  };
});

const StyledCheckoutSection = styled('div')(({ theme }) => ({
  padding: '12px 0',
  [theme.breakpoints.down('md')]: {
    '& button': {
      marginLeft: 0,
    },
  },
}));

const SxTypography = () => {
  const theme = useTheme();

  return {
    color: theme.color.headline,
    fontSize: '.8rem',
    lineHeight: '1.5em',
  };
};

export { StyledButton, StyledCheckoutSection, StyledRoot, SxTypography };
