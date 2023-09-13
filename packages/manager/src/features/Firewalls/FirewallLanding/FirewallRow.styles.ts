import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import { TableCell } from 'src/components/TableCell';

export const StyledLink = styled(Link, { label: 'StyledLink' })(() => ({
  '&:hover, &:focus': {
    textDecoration: 'underline',
  },
  display: 'block',
  fontSize: '.875rem',
  lineHeight: '1.125rem',
}));

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
