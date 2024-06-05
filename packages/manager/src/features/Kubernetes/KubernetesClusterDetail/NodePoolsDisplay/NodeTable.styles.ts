import { styled } from '@mui/material/styles';

import VerticalDivider from 'src/assets/icons/divider-vertical.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Table } from 'src/components/Table';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';

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
  [`&:hover .copy-tooltip > svg, & .copy-tooltip:focus > svg`]: {
    opacity: 1,
  },
  marginLeft: 4,
}));

export const StyledTable = styled(Table, {
  label: 'Table',
})(({ theme }) => ({
  borderLeft: `1px solid ${theme.borderColors.borderTable}`,
  borderRight: `1px solid ${theme.borderColors.borderTable}`,
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
