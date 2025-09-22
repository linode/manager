import { List } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledTruncatedList = styled(List, {
  label: 'StyledTruncatedList',
})(({ theme }) => ({
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
  // Show right border on all visible items except the last visible one (@supports is really here to get around our test environment limitations - :has is widely supported)
  // - The item does not have the hidden attribute
  // - There exists a following visible <li>
  '@supports (selector(:has(*)))': {
    '& li:not([hidden]):has(~ li:not([hidden])) > span': {
      borderRight: `1px solid ${theme.tokens.alias.Border.Normal}`,
    },
  },
}));
