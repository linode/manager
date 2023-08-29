import { default as _TableRow } from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';

import type { TableRowProps } from './TableRow';
import { isPropValid } from 'src/utilities/isPropValid';

export const StyledTableRow = styled(_TableRow, {
  label: 'StyledTableRow',
  shouldForwardProp: (prop) => isPropValid(['forceIndex'], prop),
})<TableRowProps>(({ theme, ...props }) => ({
  backgroundColor: theme.bg.bgPaper,
  borderLeft: `1px solid ${theme.borderColors.borderTable}`,
  borderRight: `1px solid ${theme.borderColors.borderTable}`,
  [theme.breakpoints.up('md')]: {
    boxShadow: `inset 3px 0 0 transparent`,
  },
  transition: theme.transitions.create(['box-shadow']),
  ...(props.forceIndex && {
    '& td': {
      transition: theme.transitions.create(['color']),
    },
    '&:before': {
      borderLeft: `1px solid transparent`,
      paddingLeft: 4,
    },
    '&:focus': {
      backgroundColor: theme.bg.lightBlue1,
    },
    '&:hover': {
      '& td': {
        color: theme.palette.primary.light,
      },
      cursor: 'pointer',
    },
    transition: theme.transitions.create(['border-color']),
  }),
  ...(props.selected && {
    '& td': {
      '&:first-of-type': {
        borderLeft: `1px solid ${theme.palette.primary.light}`,
      },
      borderBottomColor: theme.palette.primary.light,
      borderTop: `1px solid ${theme.palette.primary.light}`,
      position: 'relative',
      [theme.breakpoints.down('lg')]: {
        '&:last-child': {
          borderRight: `1px solid ${theme.palette.primary.light}`,
        },
      },
    },
    '&:before': {
      backgroundColor: theme.bg.lightBlue1,
      borderColor: theme.borderColors.borderTable,
      transition: 'none',
    },
    backgroundColor: theme.bg.lightBlue1,
    boxShadow: `inset 3px 0 0 ${theme.bg.lightBlue1}`,
    transform: 'scale(1)',
  }),
  ...(props.highlight && {
    backgroundColor: theme.bg.lightBlue1,
  }),
  ...(props.disabled && {
    '& td': {
      color: '#D2D3D4',
    },
    backgroundColor: 'rgba(247, 247, 247, 0.25)',
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
  '&:after': {
    background: `linear-gradient(to right bottom, ${theme.palette.primary.light} 0%, ${theme.palette.primary.light} 49%, transparent 50.1%)`,
    content: '""',
    height: '50%',
    left: 0,
    position: 'absolute',
    top: '50%',
    width: 15,
  },
  '&:before': {
    background: `linear-gradient(to right top, ${theme.palette.primary.light} 0%, ${theme.palette.primary.light} 49%, transparent 50.1%)`,
    content: '""',
    height: '50%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: 15,
  },
}));

export const StyledActiveCaretOverlay = styled('span', {
  label: 'StyledActiveCaretOverlay',
})(({ theme }) => ({
  '&:after': {
    background: `linear-gradient(to right bottom, ${theme.bg.lightBlue1} 0%, ${theme.bg.lightBlue1} 45%, transparent 46.1%)`,
    bottom: 0,
    content: '""',
    height: '50%',
    left: 0,
    position: 'absolute',
    width: 15,
  },
  '&:before': {
    background: `linear-gradient(to right top, ${theme.bg.lightBlue1} 0%, ${theme.bg.lightBlue1} 45%, transparent 46.1%)`,
    content: '""',
    height: '50%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: 15,
  },
}));
