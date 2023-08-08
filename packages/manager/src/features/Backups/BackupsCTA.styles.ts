import { styled } from '@mui/material/styles';

import { Paper } from 'src/components/Paper';

export const StyledPaper = styled(Paper, {
  label: 'StyledPaper',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  margin: `${theme.spacing(1)} 0 ${theme.spacing(3)} 0`,
  padding: theme.spacing(1),
  paddingRight: theme.spacing(2),
}));
