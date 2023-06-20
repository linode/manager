import Chip from 'src/components/core/Chip';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import { TableCell } from 'src/components/TableCell';

const StyledChip = styled(Chip, { label: 'StyledChip' })(() => {
  const theme = useTheme();
  return {
    backgroundColor: theme.color.green,
    color: '#fff',
    textTransform: 'uppercase',
    marginLeft: theme.spacing(2),
  };
});

const StyledRadioCell = styled(TableCell, { label: 'StyledRadioCell' })(() => {
  const theme = useTheme();
  return {
    height: theme.spacing(6),
    width: '3%',
    paddingRight: 0,
  };
});

export { StyledChip, StyledRadioCell };
