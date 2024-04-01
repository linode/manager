import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Notice } from 'src/components/Notice/Notice';

export const StyledNotice = styled(Notice, { label: 'StyledNotice' })({
  marginBottom: '0px !important',
  // @TODO: Remove the !important's once Notice.tsx has been refactored to use MUI's styled()
  padding: '8px !important',
});

export const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionPanel',
})(({ theme }) => ({
  '& button': {
    alignSelf: 'flex-end',
  },
  justifyContent: 'flex-start',
  marginTop: theme.spacing(2),
  paddingTop: 0,
}));

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(
  ({ theme }) => ({
    paddingTop: theme.spacing(3),
  })
);
