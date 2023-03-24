import { styled } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import HelpIcon from 'src/components/HelpIcon';

export const StyledHelpIcon = styled(HelpIcon)({
  padding: '0px 0px 4px 8px',
  '& svg': {
    fill: 'currentColor',
    stroke: 'none',
  },
});

export const useExpandIconStyles = makeStyles(() => ({
  expandIconStyles: {
    marginTop: '8px',
  },
}));
