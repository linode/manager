import { styled } from '@mui/material/styles';

import { List } from 'src/components/List';

export const StyledDetailPanelFormattedRegionList = styled(List, {
  label: 'StyledFormattedRegionList',
})(({ theme }) => ({
  '& li': {
    padding: `4px 0`,
  },
  padding: `${theme.spacing(0.5)} ${theme.spacing()}`,
}));
