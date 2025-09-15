import { styled } from '@mui/material/styles';

import { Box } from '../../Box/Box';

interface DayBoxProps {
  isEnd: boolean | null;
  isSelected: boolean | null;
  isStart: boolean | null;
}

export const DayBox = styled(Box, {
  label: 'DayBox',
  shouldForwardProp: (prop) =>
    prop !== 'isSelected' && prop !== 'isStart' && prop !== 'isEnd',
})<DayBoxProps>(({ isSelected, isStart, isEnd, theme }) => {
  // Apply rounded edges to create smooth visual flow for date ranges
  const getBorderRadius = () => {
    if (isStart && isEnd) return '50%'; // Single date - fully rounded
    if (isStart) return '50% 0 0 50%'; // Start date - rounded left side
    if (isEnd) return '0 50% 50% 0'; // End date - rounded right side
    return '0'; // Middle dates - no rounding
  };

  return {
    backgroundColor: isSelected
      ? theme.tokens.component.Calendar.DateRange.Background.Default
      : 'transparent',
    borderRadius: isSelected ? getBorderRadius() : '0',
  };
});

export const DayBoxInner = styled(Box, {
  label: 'DayBoxInner',
  shouldForwardProp: (prop) =>
    prop !== 'isSelected' && prop !== 'isStart' && prop !== 'isEnd',
})<DayBoxProps>(({ isSelected, isStart, isEnd, theme }) => ({
  '&:hover': {
    backgroundColor: theme.tokens.component.Calendar.DateRange.Background.Hover,
    color:
      isStart && isEnd
        ? theme.tokens.component.Calendar.SelectedItem.Text
        : theme.tokens.component.Calendar.HoverItem.Text,
  },
  alignItems: 'center',
  backgroundColor:
    isStart || isEnd
      ? theme.tokens.component.Calendar.SelectedItem.Background.Default
      : isSelected
        ? theme.tokens.component.Calendar.DateRange.Background.Default
        : 'transparent',
  borderRadius: '50%',
  color:
    isStart || isEnd
      ? theme.tokens.component.Calendar.SelectedItem.Text
      : isSelected
        ? theme.tokens.component.Calendar.DateRange.Text
        : theme.tokens.component.Calendar.Text.Default,
  cursor: 'pointer',
  display: 'flex',
  font:
    isStart || isEnd ? theme.tokens.alias.Typography.Label.Bold.S : 'inherit',
  height: 32,
  justifyContent: 'center',
  transition: 'background-color 0.2s ease',
  width: 32,
}));
