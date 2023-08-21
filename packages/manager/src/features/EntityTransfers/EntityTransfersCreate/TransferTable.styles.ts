import { styled } from '@mui/material/styles';

import { Checkbox } from 'src/components/Checkbox';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
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
  '& svg': { color: '#cccccc' },
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
  '& thead': {
    '& th': {
      '&:first-of-type': {
        borderLeft: 'none',
        paddingLeft: 0,
        paddingRight: 0,
      },
      '&:last-of-type': {
        borderRight: 'none',
      },
      backgroundColor: theme.bg.tableHeader,
      borderBottom: `2px solid ${theme.borderColors.borderTable}`,
      borderLeft: `1px solid ${theme.borderColors.borderTable}`,
      borderRight: `1px solid ${theme.borderColors.borderTable}`,
      borderTop: `2px solid ${theme.borderColors.borderTable}`,
      color: theme.textColors.tableHeader,
      fontFamily: theme.font.bold,
      fontSize: '0.875em !important',
      padding: '0px 15px',
    },
  },
  marginTop: theme.spacing(),
}));
