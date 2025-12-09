import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

type StyledCopyTooltipProps = { isHovered: boolean };

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip ',
  shouldForwardProp: omittedProps(['isHovered']),
})<StyledCopyTooltipProps>(({ isHovered }) => ({
  '& svg': {
    height: `12px`,
    width: `12px`,
  },
  ':focus': {
    opacity: 1,
  },
  marginLeft: 4,
  opacity: isHovered ? 1 : 0,
  top: 1,
}));
