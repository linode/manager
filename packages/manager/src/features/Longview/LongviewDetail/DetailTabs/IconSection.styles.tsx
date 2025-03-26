import { styled, SxProps } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { IconTextLink } from 'src/components/IconTextLink/IconTextLink';

const sxGrid: SxProps = {
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  wrap: 'nowrap',
};

export const StyledHeaderGrid = styled(Grid, { label: 'StyledHeaderGrid' })({
  ...sxGrid,
  alignItems: 'flex-start',
});

export const StyledIconContainerGrid = styled(Grid, {
  label: 'StyledIconContainerGrid',
})({
  '&:last-of-type': {
    marginBottom: 0,
  },
  alignItems: 'center',
  ...sxGrid,
});

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
    marginRight: 18,
  },
  fontSize: '0.875rem',
  padding: 0,
}));

export const StyledPackageGrid = styled(Grid, { label: 'StyledPackageGrid' })({
  alignSelf: 'center',
  boxSizing: 'border-box',
});
