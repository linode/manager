import { styled } from '@mui/material/styles';
import { TableCell } from 'akamai-cds-react-components/Table';

export const StyledActionMenuWrapper = styled(TableCell, {
  label: 'StyledActionMenuWrapper',
})(({ theme }) => ({
  justifyContent: 'flex-end',
  display: 'flex',
  alignItems: 'center',
  maxWidth: 40,
  '& button': {
    padding: 0,
    color: theme.tokens.alias.Content.Icon.Primary.Default,
    backgroundColor: 'transparent',
  },
  '& button:hover': {
    backgroundColor: 'transparent',
    color: theme.tokens.alias.Content.Icon.Primary.Hover,
  },
}));
