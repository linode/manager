import { styled } from '@mui/material/styles';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { makeStyles } from '@mui/styles';

export const StyledHelpIcon = styled(TooltipIcon)({
  padding: '0px 0px 0px 4px',
  verticalAlign: 'bottom',
  '&& svg': {
    fill: 'currentColor',
    stroke: 'none',
    fontWeight: 'normal',
  },
});

export const useExpandIconStyles = makeStyles(() => ({
  expandIconStyles: {
    marginTop: '8px',
  },
}));
