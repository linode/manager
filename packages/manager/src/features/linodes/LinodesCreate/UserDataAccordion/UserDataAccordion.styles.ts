import { styled } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import HelpIcon from 'src/components/HelpIcon';

export const StyledHelpIcon = styled(HelpIcon)({
  padding: '0px 0px 0px 4px',
  verticalAlign: 'bottom',
  '& svg': {
    fill: 'currentColor',
    stroke: 'none !important',
    fontWeight: 'normal !important',
  },
});

export const useExpandIconStyles = makeStyles(() => ({
  expandIconStyles: {
    marginTop: '8px',
  },
}));
