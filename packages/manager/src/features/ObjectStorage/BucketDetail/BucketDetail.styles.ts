import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import { LinkStyledButton } from 'src/components/Button/LinkStyledButton';
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

export const StyledTryAgainButton = styled(LinkStyledButton, {
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
  textDecoration: 'underline',
  cursor: 'pointer',
}));
