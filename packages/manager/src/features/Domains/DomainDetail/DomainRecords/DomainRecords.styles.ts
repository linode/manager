import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';

import { TableCell } from 'src/components/TableCell';

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(
  ({ theme }) => ({
    '& .MuiGrid-item': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .domain-btn': {
      [theme.breakpoints.down('lg')]: {
        marginRight: theme.spacing(),
      },
    },
    margin: 0,
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
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

export const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
}));
