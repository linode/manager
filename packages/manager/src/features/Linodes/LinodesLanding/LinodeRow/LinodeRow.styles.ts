import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';

import type { Theme } from '@mui/material/styles';

type StyledMaintenanceCellProps = { maintenance: boolean };

const statusLinkStyles = (theme: Theme) => ({
  '& p': {
    color: theme.textColors.linkActiveLight,
    font: theme.font.bold,
  },
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
});

export const StyledButton = styled('button', { label: 'StyledButton' })(
  ({ theme }) => ({
    ...statusLinkStyles(theme),
  })
);

export const StyledIpTableCell = styled(TableCell, {
  label: 'StyledIpTableCell',
})({
  '& *': {
    fontSize: '.875rem',
    paddingBottom: 0,
    paddingTop: 0,
  },
  '& button:hover': {
    backgroundColor: 'transparent',
  },
});

export const StyledMaintenanceTableCell = styled(TableCell, {
  label: 'StyledMaintenanceTableCell',
  shouldForwardProp: omittedProps(['maintenance']),
})<StyledMaintenanceCellProps>(({ maintenance, theme }) => ({
  ...(maintenance
    ? {
        '& .data': {
          alignItems: 'center',
          display: 'flex',
          lineHeight: 1.2,
          marginRight: -12,
          [theme.breakpoints.up('md')]: {
            minWidth: 200,
          },
        },
        '& button': {
          color: theme.textColors.linkActiveLight,
          padding: '0 6px',
          position: 'relative',
        },
        [theme.breakpoints.up('md')]: {
          width: '20%',
        },
      }
    : {}),
}));
