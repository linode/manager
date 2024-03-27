import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableRow } from 'src/components/TableRow';

export const StyledTableRow = styled(TableRow, {
  label: 'TableRow',
})(({ theme }) => ({
  '& svg': {
    height: `12px`,
    opacity: 0,
    width: `12px`,
  },
  '&:hover': {
    backgroundColor: theme.bg.lightBlue1,
  },
  [`&:hover > svg, & :focus > svg`]: {
    opacity: 1,
  },
  marginLeft: 4,
  top: 1,
}));

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
