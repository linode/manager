import MuiSlider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

export const StyledSlider = styled(MuiSlider, {
  label: 'StyledSlider',
})(({ theme }) => ({
  '& .MuiSlider-thumb': {
    backgroundColor: theme.tokens.color.Ultramarine[70],
    border: '1px solid white',
    height: 16,
    width: 16,
  },
  '& .MuiSlider-rail': {
    backgroundColor: theme.tokens.component.ProgressBar.StatusLine.Default,
    height: 4,
    opacity: 1,
  },
  '& .MuiSlider-track': {
    background: `linear-gradient(to right, ${theme.tokens.color.Ultramarine[60]}, ${theme.tokens.color.Ultramarine[70]})`,
    border: 'none',
    height: 4,
  },
  color: theme.tokens.color.Ultramarine[70],
}));
