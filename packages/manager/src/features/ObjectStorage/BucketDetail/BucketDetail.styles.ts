import { styled } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { TableCell } from 'src/components/TableCell';
import { Typography } from 'src/components/Typography';

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

export const StyledTryAgainButton = styled(StyledLinkButton, {
  label: 'StyledTryAgain',
})(() => ({
  width: '10%',
}));

export const StyledCreateFolderButton = styled(Button, {
  label: 'StyledCreateFolderButton',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
}));

export const StyledFooter = styled(Typography, {
  label: 'StyledFooter',
})(({ theme }) => ({
  color: theme.palette.primary.main,
  cursor: 'pointer',
  textDecoration: 'underline',
}));
