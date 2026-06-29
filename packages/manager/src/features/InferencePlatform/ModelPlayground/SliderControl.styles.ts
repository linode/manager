import OutlinedInput from '@mui/material/OutlinedInput';
import MuiSlider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

export const StyledOutlinedInput = styled(OutlinedInput, {
  label: 'StyledOutlinedInput',
})(({ theme }) => ({
  '& input': {
    fontSize: theme.tokens.font.FontSize.Xs,
    padding: '4px 0',
    textAlign: 'left',
  },
  '& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button': {
    opacity: 0,
  },
  '&:hover input::-webkit-inner-spin-button, &:hover input::-webkit-outer-spin-button':
    { opacity: 1 },
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  width: 80,
}));

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
