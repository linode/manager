import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
// This component was built asuming an unmodified MUI <Table />
import Table from '@mui/material/Table';

import { isPropValid } from 'src/utilities/isPropValid';
import type { HeaderProps } from './LinodeEntityDetail';
import { Chip } from 'src/components/Chip';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

// ---------------------------------------------------------------------
// Header Styles
// ---------------------------------------------------------------------

type StyledChipProps = Pick<HeaderProps, 'isSummaryView'> & {
  hasSecondaryStatus: boolean;
  isOffline: boolean;
  isOther: boolean;
  isRunning: boolean;
};

export const StyledLink = styled(Link, { label: 'StyledLink' })(
  ({ theme }) => ({
    '&:hover': {
      color: theme.palette.primary.light,
      textDecoration: 'underline',
    },
    marginLeft: theme.spacing(),
  })
);

export const StyledChip = styled(Chip, {
  label: 'StyledChip',
  shouldForwardProp: (prop) =>
    isPropValid(
      [
        'isSummaryView',
        'hasSecondaryStatus',
        'isOffline',
        'isOther',
        'isRunning',
      ],
      prop
    ),
})<StyledChipProps>(
  ({
    theme,
    isSummaryView,
    hasSecondaryStatus,
    isOffline,
    isOther,
    isRunning,
  }) => ({
    borderRadius: 0,
    fontSize: '0.875rem',
    height: theme.spacing(3),
    letterSpacing: '.5px',
    marginLeft: theme.spacing(2),
    '&:before': {
      ...(isOffline && {
        backgroundColor: theme.color.grey8,
      }),
      ...(isOther && {
        backgroundColor: theme.color.orange,
      }),
      ...(isRunning && {
        backgroundColor: theme.color.teal,
      }),
    },
    ...(hasSecondaryStatus && {
      borderRight: `1px solid ${theme.borderColors.borderTypography}`,
      paddingRight: `${theme.spacing(2)}`,
    }),
    ...(isSummaryView && {
      [theme.breakpoints.down('lg')]: {
        marginLeft: theme.spacing(),
      },
    }),
  })
);

// ---------------------------------------------------------------------
// Body Styles
// ---------------------------------------------------------------------

export const StyledBodyGrid = styled(Grid, { label: 'StyledBodyGrid' })(
  ({ theme }) => ({
    justifyContent: 'space-between',
    padding: theme.spacing(2),
  })
);

export const StyledColumnLabelGrid = styled(Grid, {
  label: 'StyledColumnLabelGrid',
})(({ theme }) => ({
  color: theme.textColors.headlineStatic,
  fontFamily: theme.font.bold,
}));

export const StyledRightColumnGrid = styled(Grid, {
  label: 'StyledRightColumnGrid',
})(({ theme }) => ({
  flexBasis: '75%',
  flexWrap: 'nowrap',
  paddingBottom: 0,
  paddingRight: 0,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const StyledSummaryGrid = styled(Grid, { label: 'StyledSummaryGrid' })(
  ({ theme }) => ({
    '& > div': {
      flexBasis: '50%',
      [theme.breakpoints.down('md')]: {
        flexBasis: '100%',
      },
    },
    '& p': {
      color: theme.textColors.tableStatic,
    },
  })
);

// ---------------------------------------------------------------------
// AccessTable Styles
// ---------------------------------------------------------------------

export const StyledTable = styled(Table, { label: 'StyledTable' })(
  ({ theme }) => ({
    '& td': {
      border: 'none',
      borderBottom: `1px solid ${theme.bg.bgPaper}`,
      fontSize: '0.875rem',
      lineHeight: 1,
      whiteSpace: 'nowrap',
    },
    '& th': {
      backgroundColor: theme.bg.app,
      borderBottom: `1px solid ${theme.bg.bgPaper}`,
      color: theme.textColors.textAccessTable,
      fontSize: '0.875rem',
      fontWeight: 'bold',
      lineHeight: 1,
      padding: theme.spacing(),
      textAlign: 'left',
      whiteSpace: 'nowrap',
      width: 170,
    },
    '& tr': {
      height: 32,
    },
    tableLayout: 'fixed',
  })
);

export const StyledTableGrid = styled(Grid, { label: 'StyledTableGrid' })(
  ({ theme }) => ({
    '&.MuiGrid-item': {
      padding: 0,
      paddingLeft: theme.spacing(),
    },
  })
);

export const StyledTableCell = styled(TableCell, { label: 'StyledTableCell' })(
  ({ theme }) => ({
    '& div': {
      fontSize: 15,
    },
    alignItems: 'center',
    backgroundColor: theme.bg.bgAccessRow,
    color: theme.textColors.tableStatic,
    display: 'flex',
    fontFamily: '"UbuntuMono", monospace, sans-serif',
    justifyContent: 'space-between',
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
    position: 'relative',
  })
);

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})({
  '& svg': {
    height: `12px`,
    opacity: 0,
    width: `12px`,
  },
});

export const StyledGradientDiv = styled('div', { label: 'StyledGradientDiv' })(
  ({ theme }) => ({
    '&:after': {
      backgroundImage: `linear-gradient(to right,  ${theme.bg.bgAccessRowTransparentGradient}, ${theme.bg.bgAccessRow});`,
      bottom: 0,
      content: '""',
      height: '100%',
      position: 'absolute',
      right: 0,
      width: 30,
    },
    overflowX: 'auto',
    overflowY: 'hidden', // For Edge
    paddingRight: 15,
  })
);

export const StyledTableRow = styled(TableRow, { label: 'StyledTableRow' })({
  '&:hover .copy-tooltip > svg, & .copy-tooltip:focus > svg': {
    opacity: 1,
  },
});
