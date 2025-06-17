import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(
  ({ theme }) => ({
    '& .MuiGrid-item': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .domain-btn': {
      marginBottom: theme.spacingFunction(8),
    },
    margin: 0,
    width: '100%',
  })
);

export const StyledTableCell = styled(TableCell, { label: 'StyledTableCell' })(
  ({ theme }) => ({
    '& .data': {
      maxWidth: 300,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      [theme.breakpoints.up('md')]: {
        maxWidth: 750,
      },
      whiteSpace: 'nowrap' as const,
    },
    '&:last-of-type': {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    whiteSpace: 'nowrap' as const,
    width: 'auto',
  })
);
