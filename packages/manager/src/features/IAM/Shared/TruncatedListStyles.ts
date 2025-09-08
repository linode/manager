import { List } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledTruncatedList = styled(List, {
  label: 'StyledTruncatedList',
})(() => ({
  margin: 0,
  padding: 0,
  display: 'flex',
  listStyleType: 'none',
  flexWrap: 'wrap',
  maxHeight: '3.2em',
  '&.expanded': {
    maxHeight: 'none',
  },
}));
