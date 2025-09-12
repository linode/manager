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
  '& .visible-overflow-button': {
    flex: 1,
    display: 'flex',
    justifyContent: 'end',
  },
  '& .last-visible-before-overflow': {
    position: 'relative',
    '&::after': {
      content: "'...'",
      display: 'inline',
      top: 2,
      position: 'absolute',
      right: -3,
    },
  },
}));
