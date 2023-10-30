import Grid from '@mui/material/Unstable_Grid2';
import { Theme, styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';

const libRadioLabel = {
  cursor: 'pointer',
};

const stackScriptUsernameStyling = (theme: Theme) => {
  return {
    ...libRadioLabel,
    color: theme.textColors.tableStatic,
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
  };
};

const rowStyles = {
  '& > button': {
    height: 46,
  },
  height: 46,
};

const libTitle = (theme: Theme) => {
  return {
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    [theme.breakpoints.down('md')]: {
      wordBreak: 'break-all',
    },
    whiteSpace: 'nowrap' as const,
  };
};

export const StyledTitleTypography = styled(Typography, {
  label: 'StyledTitleTypography',
})(({ theme }) => ({
  ...libTitle(theme),
}));

export const StyledTitleTableCell = styled(TableCell, {
  label: 'StyledTitleTableCell',
})(({ theme }) => ({
  ...libTitle(theme),
}));

export const StyledDetailsButton = styled(Button, {
  label: 'StyledDetailsButton',
})(({ theme }) => ({
  '&:hover, &:focus': {
    backgroundColor: 'transparent',
  },
  fontFamily: theme.font.normal,
  fontSize: '0.875rem',
  marginTop: 0,
  padding: theme.spacing(),
  [theme.breakpoints.down('sm')]: {
    marginBottom: 4,
    marginLeft: 0,
    paddingBottom: 4,
    paddingTop: 4,
  },
  width: 100,
}));

export const StyledLabel = styled('label', { label: 'StyledLabel' })({
  ...libRadioLabel,
});

export const StyledSelectionGrid = styled(Grid, {
  label: 'StyledSelectionGrid',
})(({ theme }) => ({
  alignItems: 'center',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  width: '100%',
}));

export const StyledSelectionButtonGrid = styled(Grid, {
  label: 'StyledSelectionButtonGrid',
})(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    '&.MuiGrid-item': {
      paddingLeft: 0,
      paddingTop: 0,
    },
  },
}));

export const StyledSelectionDetailsGrid = styled(Grid, {
  label: 'StyledSelectionDetailsGrid',
})(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    '&.MuiGrid-item': {
      marginTop: 4,
      paddingBottom: 0,
    },
  },
}));

export const StyledTableCell = styled(TableCell, { label: 'StyledTableCell' })({
  padding: 0,
  width: '100%',
});

export const StyledImagesTableCell = styled(TableCell, {
  label: 'StyledImagesTableCell',
})({
  fontSize: '0.75rem',
  overflowWrap: 'break-word',
  whiteSpace: 'pre-wrap',
});

export const StyledTableRow = styled(TableRow, { label: 'StyledTableRow' })({
  ...rowStyles,
});

export const StyledRowTableCell = styled(TableCell, {
  label: 'StyledRowTableCell',
})({
  ...rowStyles,
});

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  color: theme.textColors.tableHeader,
  fontSize: '.75rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  [theme.breakpoints.between('sm', 'xl')]: {
    wordBreak: 'break-word',
  },
  whiteSpace: 'nowrap',
}));

export const StyledUsernameLabel = styled('label', {
  label: 'StyledUsernameLabel',
})(({ theme }) => ({
  ...stackScriptUsernameStyling(theme),
}));

export const StyledLabelSpan = styled('span', { label: 'StyledLabelSpan' })({
  ...libRadioLabel,
});

export const StyledUsernameSpan = styled('span', {
  label: 'StyledUsernameSpan',
})(({ theme }) => ({
  ...stackScriptUsernameStyling(theme),
}));

export const StyledLink = styled(Link, { label: 'StyledLink' })(
  ({ theme }) => ({
    color: theme.textColors.tableStatic,
  })
);

export const StyledStackScriptSectionTableCell = styled(TableCell, {
  label: 'StyledStackScriptSectionTableCell',
})({
  border: 0,
  paddingTop: 100,
});
