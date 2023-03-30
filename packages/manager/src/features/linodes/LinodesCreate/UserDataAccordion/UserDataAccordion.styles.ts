import { styled } from '@mui/material/styles';
import HelpIcon from 'src/components/TooltipIcon';
import { makeStyles } from '@mui/styles';

export const StyledHelpIcon = styled(HelpIcon)({
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
