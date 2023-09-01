import { styled, SxProps } from '@mui/material/styles';

import { Grid } from 'src/components/Grid';
import { IconTextLink } from 'src/components/IconTextLink/IconTextLink';

const sxGrid: SxProps = {
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  wrap: 'nowrap',
};

export const StyledHeaderGrid = styled(Grid, { label: 'StyledHeaderGrid' })(
  ({ theme }) => ({
    ...sxGrid,
    alignItems: 'flex-start',
    marginBottom: `calc(${theme.spacing(3)} - 2px)`,
  })
);

export const StyledIconContainerGrid = styled(Grid, {
  label: 'StyledIconContainerGrid',
})(({ theme }) => ({
  '&:last-of-type': {
    marginBottom: 0,
  },
  alignItems: 'center',
  marginBottom: `calc(${theme.spacing(2)} - 2px)`,
  ...sxGrid,
}));

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

export const StyledPackageGrid = styled(Grid, { label: 'StyledPackageGrid' })({
  alignSelf: 'center',
  boxSizing: 'border-box',
  marginLeft: '8px',
});
