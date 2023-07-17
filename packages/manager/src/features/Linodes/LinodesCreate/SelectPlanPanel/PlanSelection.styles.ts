import { styled } from '@mui/material/styles';

import { Chip } from 'src/components/Chip';
import { TableCell } from 'src/components/TableCell';

export const StyledChip = styled(Chip, { label: 'StyledChip' })(
  ({ theme }) => ({
    backgroundColor: theme.color.green,
    color: '#fff',
    marginLeft: theme.spacing(2),
    textTransform: 'uppercase',
  })
);

export const StyledRadioCell = styled(TableCell, { label: 'StyledRadioCell' })(
  ({ theme }) => ({
    height: theme.spacing(6),
    paddingRight: 0,
    width: '3%',
  })
);
