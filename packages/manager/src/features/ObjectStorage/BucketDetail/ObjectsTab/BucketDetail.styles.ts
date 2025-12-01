import { Button, LinkButton, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';

export const StyledNameColumn = styled(TableCell, {
  label: 'StyledNameColumn',
})(() => ({
  width: '50%',
}));

export const StyledSizeColumn = styled(TableCell, {
  label: 'StyledSizeColumn',
})(() => ({
  width: '10%',
}));

export const StyledTryAgainButton = styled(LinkButton, {
  label: 'StyledTryAgain',
})(() => ({
  textDecoration: 'underline',
}));

export const StyledCreateFolderButton = styled(Button, {
  label: 'StyledCreateFolderButton',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
}));

export const StyledErrorFooter = styled(Typography, {
  label: 'StyledErrorFooter',
})(({ theme }) => ({
  color: theme.color.red,
}));

export const StyledFooter = styled(Typography, {
  label: 'StyledFooter',
})(({ theme }) => ({
  color: theme.palette.primary.main,
  cursor: 'pointer',
  textDecoration: 'underline',
}));
