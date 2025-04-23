import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { TimeRangeSelect } from '../../../shared/TimeRangeSelect';

export const StyledBox = styled(Box, { label: 'StyledBox' })(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
}));

export const StyledTimeRangeSelect = styled(TimeRangeSelect, {
  label: 'StyledTimeRangeSelect',
})({
  width: 200,
});
