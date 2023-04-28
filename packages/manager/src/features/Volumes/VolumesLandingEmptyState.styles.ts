import { styled } from '@mui/material/styles';
import Placeholder from 'src/components/Placeholder';

const StyledPlaceholder = styled(Placeholder)(({ theme }) => ({
  padding: `${theme.spacing(2)} 0`,
  [theme.breakpoints.up('md')]: {
    padding: `${theme.spacing(10)} 0 ${theme.spacing(4)}`,
  },
}));

export { StyledPlaceholder };
