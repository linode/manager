import { styled } from '@mui/material/styles';

import { StyledValueGrid } from '../DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

export const StyledConfigValue = styled(StyledValueGrid, {
  label: 'StyledValueGrid',
})(({ theme }) => ({
  padding: `${theme.spacing(0.5)}
            ${theme.spacing(1.9)}
            ${theme.spacing(0.5)}
            ${theme.spacing(0.8)}`,
}));
