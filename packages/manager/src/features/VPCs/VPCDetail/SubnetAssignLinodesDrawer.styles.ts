import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledButtonBox = styled(Box, { label: 'StyledButtonBox' })(
  ({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    margin: `${theme.spacing(3)} 0px`,
  })
);
