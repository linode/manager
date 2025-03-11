import { ActionsPanel, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const StyledEntityTypography = styled(Typography, {
  label: 'StyledEntityTypography',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
}));

export const StyledExpiryTypography = styled(Typography, {
  label: 'StyledExpiryTypography',
})(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

export const StyledUl = styled('ul', {
  label: 'StyledUl',
})({
  listStyleType: 'none',
  margin: 0,
  paddingLeft: 0,
});

export const StyledSummaryTypography = styled(Typography, {
  label: 'StyledSummaryTypography',
})(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));

export const StyledDiv = styled(Typography, {
  label: 'StyledDiv',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
}));
