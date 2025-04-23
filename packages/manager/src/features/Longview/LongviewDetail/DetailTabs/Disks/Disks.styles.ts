import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { TimeRangeSelect } from '../../../shared/TimeRangeSelect';

export const StyledBox = styled(Box, { label: 'StyledBox' })(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    marginRight: theme.spacing(),
  },
}));

export const StyledTimeRangeSelect = styled(TimeRangeSelect, {
  label: 'StyledTimeRangeSelect',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
  width: 250,
}));
