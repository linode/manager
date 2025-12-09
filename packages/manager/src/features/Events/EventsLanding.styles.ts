import { H1Header, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  font: theme.font.bold,
  fontSize: '0.875rem',
}));

export const StyledLabelTableCell = styled(TableCell, {
  label: 'StyledLabelTableCell',
})(({ theme }) => ({
  font: theme.font.bold,
  fontSize: '0.875rem',
  minWidth: 200,
  paddingLeft: 10,
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100% - 250px)',
  },
  width: 'calc(100% - 400px)',
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
