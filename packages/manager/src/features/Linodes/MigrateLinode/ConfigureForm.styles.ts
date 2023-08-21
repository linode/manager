import { styled } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { FormLabel } from 'src/components/FormLabel';
import { Paper } from 'src/components/Paper';

export const StyledPaper = styled(Paper, { label: 'StyledPaper' })(
  ({ theme }) => ({
    '& > p:first-of-type': {
      color: theme.color.label,
      fontFamily: theme.font.bold,
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
  marginBottom: theme.spacing(4),
}));

export const StyledFormLabel = styled(FormLabel, {
  label: 'StyledFormLabel',
})(({ theme }) => ({
  display: 'block',
  marginTop: theme.spacing(2),
}));

export const StyledMigrationContainer = styled(Box, {
  label: 'StyledMigrationContainer',
})(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

export const StyledMigrationBox = styled(Box, {
  label: 'StyledMigrationBox',
})(({ theme }) => ({
  width: '50%',
}));
