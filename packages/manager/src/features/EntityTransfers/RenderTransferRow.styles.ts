import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})({
  paddingLeft: '1rem',
});

export const StyledTokenTableCell = styled(TableCell, {
  label: 'StyledTokenTableCell',
})(({ theme }) => ({
  paddingLeft: '1rem',
  [theme.breakpoints.down('md')]: {
    width: '50%',
  },
  width: '40%',
}));

export const StyledCreatedExpiryTableCell = styled(TableCell, {
  label: 'StyledCreatedExpiryTableCell',
})(({ theme }) => ({
  paddingLeft: '1rem',
  [theme.breakpoints.down('sm')]: {
    width: '25%',
  },
  width: '20%',
}));

export const StyledEntitiesTableCell = styled(TableCell, {
  label: 'StyledEntitiesTableCell',
})(({ theme }) => ({
  paddingLeft: '1rem',
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
  marginTop: 2,
}));

export const StyledButton = styled('button', {
  label: 'StyledButton',
})(({ theme }) => ({
  ...theme.applyLinkStyles,
  fontSize: '0.875rem',
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
