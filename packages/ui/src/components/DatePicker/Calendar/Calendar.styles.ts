import { styled } from '@mui/material/styles';

import { Box } from '../../Box/Box';

interface DayBoxProps {
  isSelected: boolean | null;
  isStartOrEnd: boolean | null;
}

export const DayBox = styled(Box, {
  label: 'DayBox',
  shouldForwardProp: (prop) => prop !== 'isStartOrEnd' && prop !== 'isSelected',
})<DayBoxProps>(({ isSelected, isStartOrEnd, theme }) => ({
  '&:hover': {
    backgroundColor: !isStartOrEnd
      ? theme.tokens.calendar.HoverItem.Background
      : theme.tokens.action.Primary.Hover,
    border: `1px solid ${theme.tokens.calendar.Border}`,
    color: isStartOrEnd
      ? theme.tokens.calendar.SelectedItem.Text
      : theme.tokens.calendar.HoverItem.Text,
  },
  alignItems: 'center',
  backgroundColor:
    isStartOrEnd || isSelected
      ? theme.tokens.calendar.SelectedItem.Background.Default
      : 'transparent',
  borderRadius: '50%',
  color:
    isStartOrEnd || isSelected
      ? theme.tokens.calendar.SelectedItem.Text
      : theme.tokens.calendar.Text.Default,
  cursor: 'pointer',
  display: 'flex',
  height: 40,
  justifyContent: 'center',
  transition: 'background-color 0.2s ease',

  width: 40,
}));
