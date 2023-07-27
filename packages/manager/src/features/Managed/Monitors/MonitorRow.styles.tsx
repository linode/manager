import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import Grid from 'src/components/Grid';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';

export const StyledTableRow = styled(TableRow, { label: 'StyledTableRow' })({
  '&:before': {
    display: 'none',
  },
});

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
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
  label: 'StyledGrid',
})(({ theme }) => ({
  '&:hover': {
    color: theme.color.red,
  },
  alignItems: 'center',
  transition: 'color 225ms ease-in-out',
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledGrid',
})(({ theme }) => ({
  color: theme.color.red,
}));
