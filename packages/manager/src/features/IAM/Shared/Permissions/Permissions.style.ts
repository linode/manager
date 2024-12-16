import { Button, Chip, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledChip = styled(Chip, { label: 'StyledChip' })(() => ({
  '& .MuiChip-label': {
    paddingLeft: 0,
    paddingRight: 0,
  },
  border: 0,
  color: '#32363C',
  fontSize: '14px',
  margin: 0,
  padding: 0,
}));

export const sxTooltipIcon = {
  height: '16px',
  marginLeft: '10px',
  padding: 0,
  width: '16px',
};

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  color: '#32363C',
  fontFamily: theme.font.bold,
  fontSize: '14px',
  marginBottom: 0,
}));

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(() => ({
  alignItems: 'center',
  marginBottom: 0,
}));

export const StyledButton = styled(Button, { label: 'StyledButton' })(
  ({ theme }) => ({
    fontFamily: theme.font.normal,
    fontSize: '14px',
    minHeight: '20px',
    minWidth: '60px',
    padding: 0,
  })
);
