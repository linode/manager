import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

export const StyledActionRowGrid = styled(Grid, {
  label: 'StyledActionRowGrid',
})({
  '& button': {
    alignItems: 'flex-start',
  },
  alignItems: 'flex-end',
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  padding: '8px 0px',
});
