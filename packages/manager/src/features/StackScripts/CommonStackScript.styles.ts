import { Button, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';

import type { Theme } from '@mui/material/styles';

const libRadioLabel = {
  cursor: 'pointer',
};

export const StyledDetailsButton = styled(Button, {
  label: 'StyledDetailsButton',
})(({ theme }) => ({
  '&:hover, &:focus': {
    backgroundColor: 'transparent',
  },
  font: theme.font.normal,
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

const stackScriptUsernameStyling = (theme: Theme) => {
  return {
    ...libRadioLabel,
    color: theme.textColors.tableStatic,
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
  };
};

export const StyledUsernameLabel = styled('label', {
  label: 'StyledUsernameLabel',
})(({ theme }) => ({
  ...stackScriptUsernameStyling(theme),
}));

export const StyledStackScriptSectionTableCell = styled(TableCell, {
  label: 'StyledStackScriptSectionTableCell',
})({
  border: 0,
  paddingTop: 100,
});
