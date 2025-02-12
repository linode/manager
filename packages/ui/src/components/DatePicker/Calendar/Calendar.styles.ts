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
      ? theme.tokens.background.Neutral
      : theme.tokens.action.Primary.Hover,
    border: `1px solid ${theme.tokens.border.Normal}`,
    color: !isStartOrEnd
      ? theme.tokens.color.Neutrals.Black
      : theme.tokens.color.Neutrals.White,
  },
  alignItems: 'center',
  backgroundColor: isStartOrEnd
    ? theme.tokens.action.Primary.Default
    : isSelected
    ? theme.palette.primary.light
    : 'transparent',
  borderRadius: '50%',
  color:
    isStartOrEnd || isSelected
      ? theme.tokens.content.Text.Base
      : theme.tokens.content.Text.Primary.Default,
  cursor: 'pointer',
  display: 'flex',
  height: 40,
  justifyContent: 'center',
  transition: 'background-color 0.2s ease',

  width: 40,
}));
