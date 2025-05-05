import { Chip, Notice, omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { LongviewSubscriptionRowProps } from './LongviewPlans';

type StyledTableRowProps = Pick<LongviewSubscriptionRowProps, 'disabled'>;

export const StyledChip = styled(Chip, { label: 'StyledChip' })(
  ({ theme }) => ({
    borderRadius: 1,
    fontSize: '0.65rem',
    marginLeft: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    textTransform: 'uppercase',
  })
);

export const StyledClientCell = styled(TableCell, {
  label: 'StyledClientCell',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: '10%',
  },
}));

export const StyledDataOrPriceCell = styled(TableCell, {
  label: 'StyledDataOrPriceCell',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: '15%',
  },
}));

export const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  marginLeft: 2,
  paddingRight: theme.spacing(3),
  [theme.breakpoints.down('lg')]: {
    paddingRight: 0,
  },
}));

export const StyledNotice = styled(Notice, { label: 'StyledNotice' })(
  ({ theme }) => ({
    '& a': {
      color: theme.textColors.linkActiveLight,
    },
    '& a:hover': {
      color: theme.palette.primary.main,
    },
  })
);

export const StyledPlanCell = styled(TableCell, { label: 'StyledPlanCell' })(
  ({ theme }) => ({
    [theme.breakpoints.up('md')]: {
      width: '40%',
    },
  })
);

export const StyledTable = styled(Table, { label: 'StyledTable' })(
  ({ theme }) => ({
    '& tbody tr': {
      cursor: 'pointer',
    },
    '& td': {
      whiteSpace: 'nowrap',
    },
    border: `1px solid ${theme.borderColors.borderTable}`,
  })
);

export const StyledTableRow = styled(TableRow, {
  label: 'StyledTableRow',
  shouldForwardProp: omittedProps(['disabled']),
})<StyledTableRowProps>(({ disabled }) => ({
  ...(disabled && {
    cursor: 'not-allowed',
  }),
}));
