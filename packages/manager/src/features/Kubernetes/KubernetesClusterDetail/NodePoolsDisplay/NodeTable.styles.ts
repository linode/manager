import { Box, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

import VerticalDivider from 'src/assets/icons/divider-vertical.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

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
  margin: `0 ${theme.spacing(2)} 0 ${theme.spacing()}`,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(),
  },
}));

export const StyledNotEncryptedBox = styled(Box, {
  label: 'StyledNotEncryptedBox',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  margin: `0 ${theme.spacing(2)} 0 ${theme.spacing()}`,
}));

export const StyledPoolInfoBox = styled(Box, {
  label: 'StyledPoolInfoBox',
})(() => ({
  display: 'flex',
  width: '50%',
}));

export const StyledTableFooter = styled(Box, {
  label: 'StyledTableFooter',
})(({ theme }) => ({
  alignItems: 'center',
  background: theme.bg.bgPaper,
  display: 'flex',
  justifyContent: 'space-between',
  paddingLeft: theme.spacing(),
  [theme.breakpoints.down('md')]: {
    display: 'block',
    flexDirection: 'column',
    paddingBottom: theme.spacing(),
  },
}));
