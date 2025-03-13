import { styled } from '@mui/material/styles';

import { Link } from 'src/components/Link';
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
  '& a': {
    display: 'inline-block',
  },
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
  '& td': {
    paddingBottom: 4,
    paddingTop: 4,
  },
  paddingBottom: '2px',
  paddingTop: 0,
  transition: theme.transitions.create(['background-color']),
  width: '100%',
}));

export const StyledLink = styled(Link, {
  label: 'StyledLink',
})(({ theme }) => ({
  color: theme.textColors.linkActiveLight,
  display: 'block',
  font: theme.font.bold,
  fontSize: '.875rem',
  lineHeight: '1.125rem',
}));
