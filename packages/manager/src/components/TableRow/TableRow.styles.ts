import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { default as _TableRow } from '@mui/material/TableRow';

import type { TableRowProps } from './TableRow';

// TODO: Remove after initial pass
export const StyledTableRow = styled(_TableRow, {
  label: 'StyledTableRow',
  shouldForwardProp: omittedProps(['forceIndex']),
})<TableRowProps>(() => ({}));

export const StyledTableDataCell = styled('td', {
  label: 'StyledTableDataCell',
})(({ theme }) => ({
  '&:after': {
    border: 'solid',
    borderColor: 'rgba(136, 183, 213, 0)',
    borderLeftColor: theme.tokens.table.Row.Background.Hover,
    borderWidth: '20px',
    content: "''",
    height: 0,
    left: '100%',
    pointerEvents: 'none',
    position: 'absolute',
    top: 'calc(50% - 1px)',
    transform: 'translateY(-50%)',
    width: 0,
  },
  '&:before': {
    border: 'solid',
    borderColor: 'rgba(194, 225, 245, 0)',
    borderLeftColor: theme.tokens.table.Row.Border,
    borderWidth: '21px',
    content: "''",
    height: 0,
    left: '100%',
    pointerEvents: 'none',
    position: 'absolute',
    top: 'calc(50% - 1px)',
    transform: 'translateY(-50%)',
    width: 0,
  },
  padding: 0,
}));
