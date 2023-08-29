import { styled } from '@mui/material/styles';

import { Grid } from 'src/components/Grid';
import { IconTextLink } from 'src/components/IconTextLink/IconTextLink';

export const StyledIconGrid = styled(Grid, { label: 'StyledIconGrid' })({
  '& svg': {
    display: 'block',
    margin: '0 auto',
  },
});

export const StyledIconTextLink = styled(IconTextLink, {
  label: 'StyledIconTextLink',
})(({ theme }) => ({
  '& g': {
    stroke: theme.palette.primary.main,
  },
  '& svg': {
    marginRight: 15,
  },
  fontSize: '0.875rem',
  padding: 0,
}));
