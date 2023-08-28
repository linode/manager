import { styled } from '@mui/material/styles';

import { Checkbox } from 'src/components/Checkbox';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { Typography } from 'src/components/Typography';

export const StyledCheckbox = styled(Checkbox, {
  label: 'StyledCheckbox',
})({
  '& svg': {
    height: 20,
    width: 20,
  },
});

export const StyledEmptyCheckbox = styled(Checkbox, {
  label: 'StyledEmptyCheckbox',
})({
  '& svg': { height: 20, width: 20 },
});

export const StyledPaginationFooter = styled(PaginationFooter, {
  label: 'StyledPaginationFooter',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
  padding: theme.spacing(),
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
  marginTop: theme.spacing(2),
}));

export const StyledDebouncedSearchTextField = styled(DebouncedSearchTextField, {
  label: 'StyledDebouncedSearchTextField',
})(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  maxWidth: 556,
}));

export const StyledTable = styled(Table, {
  label: 'StyledTable',
})(({ theme }) => ({
  marginTop: theme.spacing(),
}));

export const StyledCheckAllTableCell = styled(TableCell, {
  label: 'StyledCheckAllTableCell',
})({
  '&&': {
    padding: 0,
    textAlign: 'center',
    width: '68px',
  },
});
