import { Chip } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';

export const StyledChip = styled(Chip, { label: 'StyledChip' })(
  ({ theme }) => ({
    backgroundColor: theme.color.green,
    color: theme.tokens.color.Neutrals.White,
    marginLeft: theme.spacing(),
    position: 'relative',
    textTransform: 'uppercase',
    top: -1,
  })
);

export const StyledRadioCell = styled(TableCell, { label: 'StyledRadioCell' })(
  ({ theme }) => ({
    height: theme.spacing(6),
    paddingRight: 0,
    width: '3%',
  })
);
