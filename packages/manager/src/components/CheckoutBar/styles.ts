import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import Button from 'src/components/Button';

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: 18,
  [theme.breakpoints.up('lg')]: {
    width: '100%',
  },
}));

const StyledDiv1 = styled('div')(() => {
  const theme = useTheme();

  return {
    minHeight: '24px',
    minWidth: '24px',
    [theme.breakpoints.down('md')]: {
      background: theme.color.white,
      padding: theme.spacing(2),
      position: 'relative !important' as 'relative',
      left: '0 !important' as '0',
      bottom: '0 !important' as '0',
    },
  };
});

const StyledDiv2 = styled('div')(({ theme }) => ({
  padding: '12px 0',
  [theme.breakpoints.down('md')]: {
    '& button': {
      marginLeft: 0,
    },
  },
  [theme.breakpoints.down('lg')]: {
    paddingBottom: `0px !important`,
  },
}));

export { StyledButton, StyledDiv1, StyledDiv2 };
