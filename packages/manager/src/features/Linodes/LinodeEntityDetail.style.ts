import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

// ---------------------------------------------------------------------
// Header Styles
// ---------------------------------------------------------------------

export const StyledLink = styled(Link, { label: 'StyledLink' })(
  ({ theme }) => ({
    '&:hover': {
      color: theme.palette.primary.light,
      textDecoration: 'underline',
    },
    color: theme.textColors.linkActiveLight,
    marginLeft: theme.spacing(),
  })
);

// ---------------------------------------------------------------------
// Body Styles
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// AccessTable Styles
// ---------------------------------------------------------------------
