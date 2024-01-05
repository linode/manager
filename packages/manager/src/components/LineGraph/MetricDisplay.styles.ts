import { styled } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { omittedProps } from 'src/utilities/omittedProps';

export const StyledTable = styled(Table, {
  label: 'StyledTable',
})(({ theme }) => ({
  border: `1px solid ${theme.borderColors.borderTable}`,
}));

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  '& > button': {
    '&:before': {
      content: '""',
      display: 'inline-block',
      height: 20,
      marginRight: theme.spacing(1),
      width: 20,
    },
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-start',
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
}));

export const StyledButton = styled(Button, {
  label: 'StyledButton',
  shouldForwardProp: omittedProps(['legendColor', 'hidden']),
})<{ legendColor?: string }>(({ hidden, legendColor, theme }) => ({
  ...(hidden && {
    '&hover, &:focus': {
      color: theme.textColors.tableStatic,
      textDecoration: 'line-through',
    },
    color: theme.textColors.tableStatic,
    textDecoration: 'line-through',
  }),
  ...(legendColor && {
    '&:before': {
      backgroundColor: theme.graphs[legendColor],
    },
  }),
}));
