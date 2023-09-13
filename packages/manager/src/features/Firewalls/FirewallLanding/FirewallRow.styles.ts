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
  '&::after': {
    background: 'white',
    content: '""',
    height: '1rem',
    position: 'absolute',
    right: 0,
    width: '1rem',
  },
  '&::before': {
    bottom: 0,
    content: '"... + More"',
    position: 'absolute',
    right: 0,
  },
  '--max-lines': 3,
  maxHeight: `3rem`,
  overflow: 'hidden',

  paddingRight: '1rem',

  position: 'relative',
}));
