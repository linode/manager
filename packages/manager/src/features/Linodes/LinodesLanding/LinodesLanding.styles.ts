import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

export const StyledWrapperGrid = styled(Grid, { label: 'StyledWrapperGrid' })({
  marginLeft: 0,
  marginRight: 0,
  width: '100%',
});

export const StyledLinkContainerGrid = styled(Grid, {
  label: 'StyledLinkContainerGrid',
})(({ theme }) => ({
  '&.MuiGrid-item': {
    paddingRight: 0,
  },
  marginTop: theme.spacing(0.5),
}));
