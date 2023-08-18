import { styled } from '@mui/material/styles';

import { H1Header } from 'src/components/H1Header/H1Header';
import { TableCell } from 'src/components/TableCell';
import { Typography } from 'src/components/Typography';

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  color: theme.textColors.tableHeader,
  fontFamily: theme.font.bold,
  fontSize: '0.875rem',
}));

export const StyledH1Header = styled(H1Header, {
  label: 'StyledH1Header',
})(({ theme }) => ({
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    marginLeft: theme.spacing(),
  },
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTyography',
})(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
}));
