import { Box, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

import VerticalDivider from 'src/assets/icons/divider-vertical.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TagCell } from 'src/components/TagCell/TagCell';

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'CopyTooltip',
})(() => ({
  '& svg': {
    height: `12px`,
    opacity: 0,
    width: `12px`,
  },
  marginLeft: 4,
  top: 1,
}));

export const StyledVerticalDivider = styled(VerticalDivider, {
  label: 'StyledVerticalDivider',
})(({ theme }) => ({
  margin: `0 ${theme.spacing(2)}`,
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  margin: `0 0 0 ${theme.spacing()}`,
}));

export const StyledTagCell = styled(TagCell, {
  label: 'StyledTagCell',
})(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    marginTop: 1,
  },
  width: '100%',
}));

export const StyledTableFooter = styled(Box, {
  label: 'StyledTableFooter',
})(({ theme }) => ({
  alignItems: 'center',
  background: theme.bg.bgPaper,
  display: 'flex',
  justifyContent: 'space-between',
  padding: `0 ${theme.spacing(2)}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));
