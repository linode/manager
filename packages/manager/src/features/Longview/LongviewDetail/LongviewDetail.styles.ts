import { styled } from '@mui/material/styles';
import { Tabs } from 'src/components/ReachTabs';

export const StyledTabs = styled(Tabs, { label: 'StyledTabs' })(
  ({ theme }) => ({
    marginBottom: `calc(${theme.spacing(3)} + 6px)`,
  })
);
