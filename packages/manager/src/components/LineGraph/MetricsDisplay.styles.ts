import { Button, omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';

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
    textAlign: 'left',
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
    whiteSpace: 'nowrap',
  },
}));

export const StyledButton = styled(Button, {
  label: 'StyledButton',
  shouldForwardProp: omittedProps(['legendColor', 'hidden']),
})<{ legendColor?: string }>(({ hidden, legendColor, theme }) => ({
  padding: 0,
  ...(legendColor && {
    '&:before': {
      backgroundColor: hidden
        ? theme.color.disabledText
        : theme.graphs[legendColor]
        ? theme.graphs[legendColor]
        : legendColor,
      flexShrink: 0,
    },
  }),
}));
