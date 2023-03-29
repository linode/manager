import { styled } from '@mui/material/styles';
import HelpIcon from 'src/components/TooltipIcon';

export const StyledHelpIcon = styled(HelpIcon)({
  padding: '0px 0px 4px 8px',
  '& svg': {
    fill: 'currentColor',
    stroke: 'none',
  },
});
