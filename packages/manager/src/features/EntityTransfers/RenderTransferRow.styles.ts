import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  paddingLeft: theme.spacing(2),
}));

export const StyledTokenTableCell = styled(TableCell, {
  label: 'StyledTokenTableCell',
})(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    width: '50%',
  },
  width: '40%',
}));

export const StyledCreatedExpiryTableCell = styled(TableCell, {
  label: 'StyledCreatedExpiryTableCell',
})(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: '25%',
  },
  width: '20%',
}));

export const StyledEntitiesTableCell = styled(TableCell, {
  label: 'StyledEntitiesTableCell',
})(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    width: '20%',
  },
  [theme.breakpoints.down('sm')]: {
    width: '25%',
  },
  width: '15%',
}));

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(({ theme }) => ({
  '& svg': {
    height: 12,
    width: 12,
  },
  marginLeft: theme.spacing(1),
  marginTop: theme.spacing(0.25),
}));

export const StyledTableRow = styled(TableRow, {
  label: 'StyledTableRow',
})({
  '&:hover': {
    '& [data-qa-copy-token]': {
      opacity: 1,
    },
  },
});

export const StyledDiv = styled('div', {
  label: 'StyledDiv',
})({
  '& [data-qa-copy-token]': {
    opacity: 0,
  },
  display: 'flex',
});
