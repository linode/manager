import { styled, Theme } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';
import { Link } from 'react-router-dom';
import { isPropValid } from 'src/utilities/isPropValid';

type StyledMaintenanceCellProps = { maintenance: boolean };

const statusLinkStyles = (theme: Theme) => ({
  '& p': {
    color: theme.textColors.linkActiveLight,
    fontFamily: theme.font.bold,
  },
  backgroundColor: 'transparent',
  border: 'none',
  // color: theme.textColors.linkActiveLight,
  cursor: 'pointer',
  padding: 0,
});

export const StyledLink = styled(Link, { label: 'StyledLink' })(
  ({ theme }) => ({
    ...statusLinkStyles(theme),
  })
);

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
  shouldForwardProp: (prop) => isPropValid(['maintenance'], prop),
})<StyledMaintenanceCellProps>(({ theme, maintenance }) => ({
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
