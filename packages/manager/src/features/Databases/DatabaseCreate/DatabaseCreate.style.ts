import { Box, Button, TextField, Typography } from '@linode/ui';
import { Grid, styled } from '@mui/material';

import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';

export const StyledLabelTooltip = styled(Box, {
  label: 'StyledLabelTooltip',
})(() => ({
  '& strong': {
    padding: 8,
  },
  '& ul': {
    margin: '4px',
  },
}));

export const StyledTextField = styled(TextField, {
  label: 'StyledTextField',
})(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    [theme.breakpoints.up('md')]: {
      minWidth: 350,
    },
  },
}));

export const StyledPlansPanel = styled(PlansPanel, {
  label: 'StyledPlansPanel',
})(() => ({
  margin: 0,
  padding: 0,
}));

export const StyledBtnCtn = styled(Grid, {
  label: 'StyledBtnCtn',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-end',
    flexDirection: 'column',
    marginTop: theme.spacing(),
  },
}));

export const StyledCreateBtn = styled(Button, {
  label: 'StyledCreateBtn',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
  whiteSpace: 'nowrap',
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  marginLeft: theme.spacing(),
  marginRight: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    marginRight: 0,
    padding: theme.spacing(),
  },
}));

export const StyledSpan = styled('span', {
  label: 'StyledSpan',
})(({ theme }) => ({
  borderRight: `1px solid ${theme.borderColors.borderTypography}`,
  color: theme.textColors.tableStatic,
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  paddingRight: theme.spacing(1),
}));
