import { Dialog, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';

export const StyledCopyDiv = styled('div', {
  label: 'StyledCopyDiv',
})(({ theme }) => ({
  alignSelf: 'flex-end',
  marginTop: theme.spacing(2),
  maxWidth: 220,
}));

export const StyledInputDiv = styled('div', {
  label: 'StyledInputDiv',
})(({ theme }) => ({
  display: 'flex',
  flexFlow: 'column nowrap',
  paddingBottom: theme.spacing(1),
}));

export const StyledDialog = styled(Dialog, {
  label: 'StyledDialog',
})(({ theme }) => ({
  paddingBottom: theme.spacing(),
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  paddingBottom: theme.spacing(),
}));

export const StyledCopyableTextField = styled(CopyableTextField, {
  label: 'StyledCopyableTextField',
})({
  maxWidth: '100%',
});
