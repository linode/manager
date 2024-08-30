import { styled } from '@mui/material/styles';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

export const StyledText = styled(Typography, {
  label: 'StyledText',
})(({ theme }) => ({
  lineHeight: 0.5,
  paddingLeft: 8,
  [theme.breakpoints.down('lg')]: {
    marginLeft: 8,
  },
  [theme.breakpoints.down('sm')]: {
    lineHeight: 1,
  },
}));

export const StyledRootContainer = styled(Paper, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  marginTop: 25,
  padding: theme.spacing(3),
}));

export const StyledHelperText = styled(Typography, {
  label: 'StyledHelperText',
})(({ theme }) => ({
  lineHeight: 1.5,
  paddingBottom: theme.spacing(),
  paddingTop: theme.spacing(),
}));

export const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})(() => ({
  display: 'flex',
  justifyContent: 'right',
  padding: 0,
}));
