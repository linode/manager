import { makeStyles } from 'tss-react/mui';
import { styled } from '@mui/material/styles';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { Theme } from '@mui/material/styles';

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

export const StyledRadioCell = styled(TableCell, {
  label: 'StyledRadioCell',
})(() => ({
  width: '18%',
}));

export const useStyles = makeStyles()((theme: Theme) => ({
  disabledRow: {
    backgroundColor: theme.bg.tableHeader,
    cursor: 'not-allowed',
    opacity: 0.4,
  },
}));
