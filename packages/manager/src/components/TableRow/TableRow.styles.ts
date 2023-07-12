import { default as _TableRow } from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import type { TableRowProps } from './TableRow';

export const StyledTableRow = styled(_TableRow, {
  label: 'StyledTableRow',
})<TableRowProps>(({ theme, ...props }) => ({
  borderLeft: `1px solid ${theme.borderColors.borderTable}`,
  borderRight: `1px solid ${theme.borderColors.borderTable}`,
  backgroundColor: theme.bg.bgPaper,
  transition: theme.transitions.create(['box-shadow']),
  [theme.breakpoints.up('md')]: {
    boxShadow: `inset 3px 0 0 transparent`,
  },
  ...(props.forceIndex && {
    '& td': {
      transition: theme.transitions.create(['color']),
    },
    transition: theme.transitions.create(['border-color']),
    '&:before': {
      borderLeft: `1px solid transparent`,
      paddingLeft: 4,
    },
    '&:hover': {
      cursor: 'pointer',
      '& td': {
        color: theme.palette.primary.light,
      },
    },
    '&:focus': {
      backgroundColor: theme.bg.lightBlue1,
    },
  }),
  ...(props.selected && {
    backgroundColor: theme.bg.lightBlue1,
    transform: 'scale(1)',
    boxShadow: `inset 3px 0 0 ${theme.bg.lightBlue1}`,
    '&:before': {
      transition: 'none',
      backgroundColor: theme.bg.lightBlue1,
      borderColor: theme.borderColors.borderTable,
    },
    '& td': {
      borderTop: `1px solid ${theme.palette.primary.light}`,
      borderBottomColor: theme.palette.primary.light,
      position: 'relative',
      '&:first-of-type': {
        borderLeft: `1px solid ${theme.palette.primary.light}`,
      },
      [theme.breakpoints.down('lg')]: {
        '&:last-child': {
          borderRight: `1px solid ${theme.palette.primary.light}`,
        },
      },
    },
  }),
  ...(props.highlight && {
    backgroundColor: theme.bg.lightBlue1,
  }),
  ...(props.disabled && {
    backgroundColor: 'rgba(247, 247, 247, 0.25)',
    '& td': {
      color: '#D2D3D4',
    },
  }),
}));

export const StyledTableDataCell = styled('td', {
  label: 'StyledTableDataCell',
})(() => ({
  padding: 0,
}));

export const StyledActiveCaret = styled('span', {
  label: 'StyledActiveCaret',
})(({ theme }) => ({
  '&:before': {
    content: '""',
    width: 15,
    height: '50%',
    position: 'absolute',
    left: 0,
    top: 0,
    background: `linear-gradient(to right top, ${theme.palette.primary.light} 0%, ${theme.palette.primary.light} 49%, transparent 50.1%)`,
  },
  '&:after': {
    content: '""',
    width: 15,
    height: '50%',
    position: 'absolute',
    left: 0,
    top: '50%',
    background: `linear-gradient(to right bottom, ${theme.palette.primary.light} 0%, ${theme.palette.primary.light} 49%, transparent 50.1%)`,
  },
}));

export const StyledActiveCaretOverlay = styled('span', {
  label: 'StyledActiveCaretOverlay',
})(({ theme }) => ({
  '&:before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    width: 15,
    height: '50%',
    background: `linear-gradient(to right top, ${theme.bg.lightBlue1} 0%, ${theme.bg.lightBlue1} 45%, transparent 46.1%)`,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 15,
    height: '50%',
    background: `linear-gradient(to right bottom, ${theme.bg.lightBlue1} 0%, ${theme.bg.lightBlue1} 45%, transparent 46.1%)`,
  },
}));
