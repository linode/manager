import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

export const StyledLink = styled(Link, { label: 'StyledLink' })(
  ({ theme }) => ({
    fontFamily: theme.font.bold,
    fontSize: 16,
    position: 'relative',
    top: 3,
  })
);
