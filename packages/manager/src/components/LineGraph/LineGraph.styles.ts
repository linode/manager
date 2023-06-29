import { Button } from 'src/components/Button/Button';
import { Table } from 'src/components/Table';
import { TableHead } from 'src/components/TableHead';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { styled } from '@mui/material/styles';
import { isPropValid } from 'src/utilities/isPropValid';

export const StyledWrapper = styled('div')(() => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column-reverse',
  width: '100%',
}));

export const StyledContainer = styled('div', {
  label: 'StyledContainer',
})(({ theme }) => ({
  borderTop: `1px solid ${theme.borderColors.divider}`,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(4),
  marginRight: 0,
  marginTop: theme.spacing(0.5),
  paddingTop: theme.spacing(0.5),
}));

export const StyledCanvasContainer = styled('div', {
  label: 'StyledCanvasContainer',
})({
  position: 'relative',
  width: '100%',
});

export const StyledTable = styled(Table, {
  label: 'StyledTable',
})(({ theme }) => ({
  maxWidth: '600px',
  width: '85%',

  [theme.breakpoints.down('lg')]: {
    width: '100%',
  },

  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
    '& .MuiTable-root': {
      display: 'flex',
    },
    '& .MuiTableRow-root': {
      flexBasis: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
  },

  '& .MuiTableRow-root': {
    border: 0,
  },

  // Both td and th
  '& .MuiTableCell-root': {
    height: 'auto',
    border: 'none',
    backgroundColor: theme.bg.offWhite,
    tableLayout: 'fixed',
    padding: theme.spacing(0.5),
  },
}));

export const StyledTableBody = styled(TableBody, {
  label: 'StyledTableBody',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
}));

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    justifyContent: 'normal',
    minHeight: 'auto',
  },
  '&:first-of-type': {
    [theme.breakpoints.down('md')]: {
      marginLeft: '-45px',
    },
  },
}));

export const StyledTableHead = styled(TableHead, {
  label: 'StyledTableHead',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'block',
    '& .MuiTableRow-root': {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: theme.spacing(5.25),
      marginRight: theme.spacing(2),
      marginTop: theme.spacing(5.25),
      '&:last-of-type': {
        marginBottom: 0,
      },
    },
  },
}));

export const StyledButton = styled(Button, {
  label: 'StyledButton',
})(({ theme }) => ({
  justifyContent: 'flex-start',
  color: theme.color.headline,
  fontFamily: theme.font.normal,
  fontSize: '0.75rem',
  margin: 0,
  marginLeft: -2,
  padding: 0,
  '&:focus': {
    outline: `1px dotted ${theme.color.grey3}`,
  },
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.color.headline,
  },
}));

export const StyledButtonElement = styled('span', {
  label: 'StyledButtonElement',
  shouldForwardProp: (prop) => isPropValid(['hidden', 'sx'], prop),
})(({ ...props }) => ({
  ...(props.hidden && {
    textDecoration: 'line-through',
  }),
}));
