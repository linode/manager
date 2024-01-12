import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';
import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(
  ({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-end',
      flexDirection: 'column',
      marginTop: theme.spacing(),
    },
  })
);

export const StyledScaleUpButton = styled(Button, {
  label: 'StyledScaleUpButton',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
  whiteSpace: 'nowrap',
}));

export const StyledPlansPanel = styled(PlansPanel, {
  label: 'StyledPlansPanel',
})(() => ({
  margin: 0,
  padding: 0,
}));

export const StyledPlanSummarySpan = styled('span', {
  label: 'StyledPlanSummarySpan',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
}));
