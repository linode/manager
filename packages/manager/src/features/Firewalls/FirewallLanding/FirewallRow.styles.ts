import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import { TableCell } from 'src/components/TableCell';

export const StyledDevicesLink = styled(Link, {
  label: 'StyledDevicesLink',
})(() => ({
  display: 'inline-block',
}));

export const StyledTableCell = styled(TableCell, { label: 'StyledTableCell' })(
  () => ({
    border: 0,
    padding: 0,
  })
);

export const StyledTruncateLinks = styled('div', {
  label: 'StyledTruncateLinks',
})(() => ({
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  display: '-webkit-box',
  overflow: 'hidden',
}));

export const StyledDivWrapper = styled('div', {
  label: 'StyledDivWrapper',
})(({ theme }) => ({
  margin: `${theme.spacing(1.5)} 0`,
}));

export const StyledSpan = styled('span', {
  label: 'StyledSpan',
})(({ theme }) => ({
  display: 'inline-block',
  marginBottom: theme.spacing(0.25),
  marginRight: theme.spacing(0.5),
}));
