import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { default as _TableRow } from '@mui/material/TableRow';

import type { TableRowProps } from './TableRow';

// TODO: Remove after initial pass
export const StyledTableRow = styled(_TableRow, {
  label: 'StyledTableRow',
  shouldForwardProp: omittedProps(['forceIndex']),
})<TableRowProps>(() => ({}));
