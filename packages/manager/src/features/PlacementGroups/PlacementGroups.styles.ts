import { List } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledDetailPanelFormattedRegionList = styled(List, {
  label: 'StyledFormattedRegionList',
})(({ theme }) => ({
  '& li': {
    padding: `4px 0`,
  },
  padding: `${theme.spacing(0.5)} ${theme.spacing()}`,
}));
