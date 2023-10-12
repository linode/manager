import { styled } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { omittedProps } from 'src/utilities/omittedProps';

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
  // Both td and th
  '& .MuiTableCell-root': {
    backgroundColor: theme.bg.offWhite,
    border: 'none',
    height: 'auto',
    padding: theme.spacing(0.5),
    tableLayout: 'fixed',
  },
  '& .MuiTableRow-root': {
    border: 0,
  },

  maxWidth: '600px',

  [theme.breakpoints.down('lg')]: {
    width: '100%',
  },

  [theme.breakpoints.down('md')]: {
    '& .MuiTable-root': {
      display: 'flex',
    },
    '& .MuiTableRow-root': {
      display: 'flex',
      flexBasis: '100%',
      flexDirection: 'column',
    },
    maxWidth: '100%',
  },

  width: '85%',
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
  '&:first-of-type': {
    [theme.breakpoints.down('md')]: {
      marginLeft: '-45px',
    },
  },
  [theme.breakpoints.down('md')]: {
    justifyContent: 'normal',
    minHeight: 'auto',
  },
}));

export const StyledTableHead = styled(TableHead, {
  label: 'StyledTableHead',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    '& .MuiTableRow-root': {
      '&:last-of-type': {
        marginBottom: 0,
      },
      display: 'flex',
      flexDirection: 'column',
      marginBottom: theme.spacing(5.25),
      marginRight: theme.spacing(2),
      marginTop: theme.spacing(5.25),
    },
    display: 'block',
  },
}));

export const StyledButton = styled(Button, {
  label: 'StyledButton',
})(({ theme }) => ({
  '&:focus': {
    outline: `1px dotted ${theme.color.grey3}`,
  },
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.color.headline,
  },
  color: theme.color.headline,
  fontFamily: theme.font.normal,
  fontSize: '0.75rem',
  justifyContent: 'flex-start',
  margin: 0,
  marginLeft: -2,
  padding: 0,
}));

export const StyledButtonElement = styled('span', {
  label: 'StyledButtonElement',
  shouldForwardProp: omittedProps(['hidden', 'sx']),
})(({ ...props }) => ({
  ...(props.hidden && {
    textDecoration: 'line-through',
  }),
}));
