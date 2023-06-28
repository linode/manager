import { Chip } from 'src/components/core/Chip';
import { styled } from '@mui/material/styles';
import { TableCell } from 'src/components/TableCell';

export const StyledChip = styled(Chip, { label: 'StyledChip' })(
  ({ theme }) => ({
    backgroundColor: theme.color.green,
    color: '#fff',
    textTransform: 'uppercase',
    marginLeft: theme.spacing(2),
  })
);

export const StyledRadioCell = styled(TableCell, { label: 'StyledRadioCell' })(
  ({ theme }) => ({
    height: theme.spacing(6),
    width: '3%',
    paddingRight: 0,
  })
);
