import { Button, omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledLegend = styled(Button, {
  label: 'StyledLegend',
  shouldForwardProp: omittedProps(['legendColor', 'hidden']),
})<{ legendColor?: string }>(({ hidden, legendColor, theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-start',
  padding: 0,
  textAlign: 'left',
  textTransform: 'none',
  [theme.breakpoints.down('sm')]: {
    padding: 0,
  },
  whiteSpace: 'nowrap',
  ...(legendColor && {
    '&:before': {
      backgroundColor: hidden
        ? theme.color.disabledText
        : theme.graphs[legendColor]
        ? theme.graphs[legendColor]
        : legendColor,
      content: '""',
      display: 'inline-block',
      flexShrink: 0,
      height: 20,
      marginRight: theme.spacing(1),
      width: 20,
    },
  }),
}));
