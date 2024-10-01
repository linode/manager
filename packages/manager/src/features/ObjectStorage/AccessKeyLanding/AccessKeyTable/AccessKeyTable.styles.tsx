import { styled } from '@mui/material';

import { TableCell } from 'src/components/TableCell';
import { omittedProps } from 'src/utilities/omittedProps';

import type { TableCellProps } from 'src/components/TableCell';

interface StyledLastColumnCellProps extends TableCellProps {
  addPaddingRight?: boolean;
}
export const StyledLastColumnCell = styled(TableCell, {
  shouldForwardProp: omittedProps(['addPaddingRight']),
})<StyledLastColumnCellProps>(({ addPaddingRight }) => ({
  '&&:last-child': {
    'padding-right': addPaddingRight ? '15px' : 0,
  },
}));

export const StyledLabelCell = styled(TableCell)(() => ({
  width: '35%',
}));
