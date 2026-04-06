import { styled } from '@mui/material/styles';

import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { MODE } from './types';

export const StyledTableRoot = styled(Table, {
  label: 'StyledTableRoot',
})(() => ({
  maxHeight: 800,
  overflowY: 'auto',
}));

export const StyledClusterCell = styled(TableCell, {
  label: 'StyledClusterCell',
})(() => ({
  width: '18%',
}));

export const StyledBucketCell = styled(TableCell, {
  label: 'StyledBucketCell',
})(() => ({
  width: '28%',
}));

export const StyledRadioRow = styled(TableRow, {
  label: 'StyledRadioRow',
})<{ disabled: boolean; mode?: MODE }>(({ disabled, mode, theme }) => ({
  '& td ': {
    color: `${theme.palette.text.primary} !important`,
  },
  ...(disabled &&
    mode !== 'viewing' && {
      backgroundColor: theme.bg.tableHeader,
      cursor: 'not-allowed',
      opacity: 0.4,
    }),
}));

export const StyledSelectAllRadioRow = styled(StyledRadioRow, {
  label: 'StyledSelectAllRadioRow',
})(({ theme }) => ({
  '& td ': {
    borderBottom: `2px solid ${theme.color.grey2}`,
  },
}));

export const StyledRadioCell = styled(TableCell, {
  label: 'StyledRadioCell',
})(() => ({
  width: '18%',
}));
