import { styled } from '@mui/material/styles';
import Placeholder from 'src/components/Placeholder';

const StyledPlaceholder = styled(Placeholder)(() => ({
  '& svg': {
    transform: 'scale(0.75)',
  },
}));

export { StyledPlaceholder };
