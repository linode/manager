import { Tabs } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledTabs = styled(Tabs, { label: 'StyledTabs' })(
  ({ theme }) => ({
    marginBottom: `calc(${theme.spacing(3)} + 6px)`,
  })
);
