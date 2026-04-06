import { Box, Paper } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledPaper = styled(Paper, { label: 'StyledPaper' })(
  ({ theme }) => ({
    '& > p:first-of-type': {
      color: theme.color.label,
      font: theme.font.bold,
      marginBottom: theme.spacing(),
      marginTop: theme.spacing(2),
    },
    marginTop: theme.spacing(4),
    padding: 0,
  })
);

export const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(),
  marginBottom: theme.spacing(2),
}));

export const StyledSpan = styled('span', {
  label: 'StyledSpan',
})(({ theme }) => ({
  color: theme.color.label,
  display: 'block',
  font: theme.font.bold,
  fontSize: theme.typography.body1.fontSize,
  lineHeight: '1.43rem',
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

export const StyledMigrationContainer = styled(Box, {
  label: 'StyledMigrationContainer',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

export const StyledMigrationBox = styled(Box, {
  label: 'StyledMigrationBox',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: '50%',
  },
  width: '100%',
}));
