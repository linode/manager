import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';

import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

export const StyledTableRow = styled(TableRow, { label: 'StyledTableRow' })({
  '&:before': {
    display: 'none',
  },
});

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  font: theme.font.bold,
  width: '30%',
}));

export const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
})(({ theme }) => ({
  '&:hover': {
    color: theme.color.red,
  },
  alignItems: 'center',
  display: 'flex',
  transition: 'color 225ms ease-in-out',
}));

export const StyledLink = styled(Link, {
  label: 'StyledLink',
})(({ theme }) => ({
  '&:hover': {
    color: theme.color.red,
  },
  alignItems: 'center',
  transition: 'color 225ms ease-in-out',
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  color: theme.color.red,
}));
