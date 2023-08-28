import { styled } from '@mui/material/styles';

import PackageIcon from 'src/assets/icons/longview/package-icon.svg';
import { Grid } from 'src/components/Grid';
import { IconTextLink } from 'src/components/IconTextLink/IconTextLink';

export const StyledIconGrid = styled(Grid, { label: 'StyledIconGrid' })({
  '& svg': {
    display: 'block',
    margin: '0 auto',
  },
  alignSelf: 'center',
  marginLeft: 0,
});

export const StyledIconSectionGrid = styled(Grid, {
  label: 'StyledIconSectionGrid',
})(({ theme }) => ({
  '&:last-of-type': {
    marginBottom: 0,
  },
  marginBottom: `calc(${theme.spacing(2)} - 2)`,
}));

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

export const StyledPackageIcon = styled(PackageIcon, {
  label: 'StyledPackageIcon',
})(({ theme }) => ({
  marginRight: theme.spacing(1),
}));
