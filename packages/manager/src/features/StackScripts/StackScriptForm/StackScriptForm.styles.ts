import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';

export const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(3),
  paddingBottom: 0,
}));

export const StyledGridWithTips = styled(Grid, { label: 'StyledGridWithTips' })(
  ({ theme }) => ({
    maxWidth: '50%',
    [theme.breakpoints.down('md')]: {
      maxWidth: '100%',
      width: '100%',
    },
  })
);

export const StyledTextField = styled(TextField, { label: 'StyledTextField' })({
  '& input': {
    paddingLeft: 0,
  },
});

export const StyledNotice = styled(Notice, { label: 'StyledNotice' })(
  ({ theme }) => ({
    backgroundColor: theme.palette.divider,
    marginLeft: theme.spacing(4),
    marginTop: `${theme.spacing(4)} !important`,
    padding: theme.spacing(4),
    [theme.breakpoints.down('lg')]: {
      paddingLeft: theme.spacing(2),
    },
    [theme.breakpoints.down('xl')]: {
      marginLeft: 0,
    },
  })
);
