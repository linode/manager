import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

export const StyledCreatedTableCell = styled(TableCell, {
  label: 'StyledCreatedTableCell',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: '20%',
  },
  width: '100%',
}));

export const StyledLabelTableCell = styled(TableCell, {
  label: 'StyledLabelTableCell',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: '35%',
  },
  width: '60%',
}));

export const StyledRegionTableCell = styled(TableCell, {
  label: 'StyledRegionTableCell',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: '15%',
  },
  width: '100%',
}));

export const StyledTagTableCell = styled(TableCell, {
  label: 'StyledTagTableCell',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: '30%',
  },
  width: '100%',
}));

export const StyledTableRow = styled(TableRow, {
  label: 'StyledTableRow',
})(({ theme }) => ({
  cursor: 'pointer',
  paddingBottom: 0,
  paddingTop: 0,
  transition: theme.transitions.create(['background-color']),
  width: '50%',
}));

export const StyledLink = styled(Link, {
  label: 'StyledLink',
})(({ theme }) => ({
  color: theme.textColors.linkActiveLight,
  display: 'block',
  fontFamily: theme.font.bold,
  fontSize: '.875rem',
  lineHeight: '1.125rem',
}));
