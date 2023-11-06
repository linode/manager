// This component was built asuming an unmodified MUI <Table />
import Table from '@mui/material/Table';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { omittedProps } from 'src/utilities/omittedProps';

import type { HeaderProps } from './LinodeEntityDetail';

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
  shouldForwardProp: omittedProps([
    'isSummaryView',
    'hasSecondaryStatus',
    'isOffline',
    'isOther',
    'isRunning',
  ]),
})<StyledChipProps>(
  ({
    hasSecondaryStatus,
    isOffline,
    isOther,
    isRunning,
    isSummaryView,
    theme,
  }) => ({
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
    borderRadius: 0,
    fontSize: '0.875rem',
    height: theme.spacing(3),
    letterSpacing: '.5px',
    marginLeft: theme.spacing(2),
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

export const StyledVPCBox = styled(Box, { label: 'StyledVPCBox' })(
  ({ theme }) => ({
    padding: 0,
    [theme.breakpoints.down('md')]: {
      paddingBottom: theme.spacing(0.5),
    },
  })
);

export const StyledBox = styled(Box, { label: 'StyledBox' })(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  [theme.breakpoints.down('md')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
}));

export const StyledLabelBox = styled(Box, { label: 'StyledLabelBox' })(
  ({ theme }) => ({
    fontFamily: theme.font.bold,
    marginRight: '4px',
  })
);

export const sxListItemMdBp = {
  borderRight: 0,
  flex: '50%',
  padding: 0,
};

export const sxLastListItem = {
  borderRight: 0,
  paddingRight: 0,
};

export const StyledListItem = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    borderRight: `1px solid ${theme.borderColors.borderTypography}`,
    color: theme.textColors.tableStatic,
    display: 'flex',
    padding: `0px 10px`,
    [theme.breakpoints.down('md')]: {
      ...sxListItemMdBp,
    },
  })
);

export const sxListItemFirstChild = (theme: Theme) => ({
  [theme.breakpoints.down('md')]: {
    ...sxListItemMdBp,
    '&:first-of-type': {
      paddingBottom: theme.spacing(0.5),
    },
  },
});

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
      fontFamily: theme.font.bold,
      fontSize: '0.875rem',
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
