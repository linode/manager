import { Button } from '@akamai/cds-components/react';
import { styled } from '@mui/material/styles';

import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';

export const StyledResizeButton = styled(Button, {
  label: 'StyledResizeButton',
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
  h2: {
    fontSize: '1.17em',
  },
}));

export const StyledPlanSummarySpan = styled('span', {
  label: 'StyledPlanSummarySpan',
})(({ theme }) => ({
  font: theme.font.bold,
}));
