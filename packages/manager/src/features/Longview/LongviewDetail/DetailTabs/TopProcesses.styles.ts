import { styled } from '@mui/material/styles';

import { Link } from 'src/components/Link';

export const StyledLink = styled(Link, { label: 'StyledLink' })(
  ({ theme }) => ({
    font: theme.font.bold,
    fontSize: 16,
    position: 'relative',
    top: 3,
  })
);
