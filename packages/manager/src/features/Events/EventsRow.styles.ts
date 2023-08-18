import { styled } from '@mui/material/styles';

import { TableRow } from 'src/components/TableRow';

import { GravatarByUsername } from '../../components/GravatarByUsername';

export const StyledGravatar = styled(GravatarByUsername, {
  label: 'StyledGravatar',
})({
  height: 24,
  width: 24,
});

export const StyledTableRow = styled(TableRow, {
  label: 'StyledTableRow',
})(({ theme }) => ({
  row: {
    '&:hover': {
      backgroundColor:
        theme.name === 'light' ? '#fbfbfb' : 'rgba(0, 0, 0, 0.1)',
    },
  },
}));
