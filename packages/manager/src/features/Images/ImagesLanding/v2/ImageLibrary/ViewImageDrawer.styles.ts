import { styled } from '@mui/material/styles';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

export const StyledLabel = styled('span', {
  label: 'StyledLabel',
})(({ theme }) => ({
  font: theme.font.bold,
}));

export const StyledCloudInitIcon = styled(CloudInitIcon, {
  label: 'StyledCloudInitIcon',
})(() => ({
  height: 16,
  width: 16,
}));

export const StyledCopyIcon = styled(CopyTooltip)(({ theme }) => ({
  '& svg': {
    height: 12,
    top: 1,
    width: 12,
  },
  marginLeft: theme.spacingFunction(4),
}));
