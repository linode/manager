import { styled } from '@mui/material/styles';

import { Paper } from 'src/components/Paper';
import { Table } from 'src/components/Table';

export const StyledLinkDiv = styled('div', { label: 'StyledLinkDiv' })(({ theme }) => ({
  display: 'block',
  marginBottom: 24,
  marginTop: theme.spacing(),
  textAlign: 'right',
}));

export const StyledPanelPaper = styled(Paper, { label: 'StyledPanelPaper' })(({ theme }) => ({
  backgroundColor: theme.color.white,
  flexGrow: 1,
  marginBottom: theme.spacing(3),
  width: '100%',
}));

export const StyledSelectingPaper = styled(Paper, { label: 'StyledSelectingPaper' })({
  maxHeight: '1000px',
  minHeight: '400px',
  overflowY: 'scroll',
  paddingTop: 0,
});