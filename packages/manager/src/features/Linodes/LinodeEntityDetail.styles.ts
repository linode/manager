// This component was built assuming an unmodified MUI <Table />
import { Typography as FontTypography } from '@linode/design-language-system';
import { Box, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { Theme } from '@mui/material/styles';

// ---------------------------------------------------------------------
// Header Styles
// ---------------------------------------------------------------------

export const StyledLink = styled(Link, { label: 'StyledLink' })(
  ({ theme }) => ({
    '&:hover': {
      color: theme.palette.primary.light,
      textDecoration: 'underline',
    },
    marginLeft: theme.spacing(),
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
  font: theme.font.bold,
}));

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
    font: theme.font.bold,
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

// ---------------------------------------------------------------------
// VPC Label Styles
// ---------------------------------------------------------------------

export const StyledIPv4Box = styled(Box, { label: 'StyledIPv4Box' })(
  ({ theme }) => ({
    '&:hover .copy-tooltip > svg, & .copy-tooltip:focus > svg': {
      opacity: 1,
    },
    border: 0,
    display: 'flex',
    marginLeft: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(0),
    },
  })
);

export const StyledIPv4Label = styled(Box, { label: 'StyledIPv4Label' })(
  ({ theme }) => ({
    alignContent: 'center',
    backgroundColor: theme.name === 'light' ? theme.color.grey10 : theme.bg.app,
    color: theme.textColors.textAccessTable,
    font: theme.font.bold,
    padding: `${theme.spacing(1)} ${theme.spacing(3)} ${theme.spacing(
      1
    )} ${theme.spacing(1.5)}`,
  })
);

export const StyledIPv4Item = styled(Box, { label: 'StyledIPv4Item' })(
  ({ theme }) => ({
    alignItems: 'center',
    backgroundColor: theme.tokens.interaction.Background.Secondary,
    display: 'flex',
    font: FontTypography.Code,
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
  })
);

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
      backgroundColor:
        theme.name === 'light' ? theme.color.grey10 : theme.bg.app,
      borderBottom: `1px solid ${theme.bg.bgPaper}`,
      color: theme.textColors.textAccessTable,
      font: theme.font.bold,
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
    border: 'none',
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
    backgroundColor: theme.tokens.interaction.Background.Secondary,
    color: theme.textColors.tableStatic,
    display: 'flex',
    font: FontTypography.Code,
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
      backgroundImage: `linear-gradient(to right,  ${theme.bg.bgAccessRowTransparentGradient}, ${theme.tokens.interaction.Background.Secondary});`,
      bottom: 0,
      content: '""',
      height: '100%',
      position: 'absolute',
      right: 0,
      width: 30,
    },
    display: 'flex',
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
