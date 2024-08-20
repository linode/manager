import { styled } from '@mui/material/styles';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { FormHelperText } from 'src/components/FormHelperText';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

export const StyledCodeSentMessageBox = styled(Box, {
  label: 'StyledCodeSentMessageBox',
})(({ theme }) => ({
  marginTop: theme.spacing(1.5),
}));

export const StyledPhoneNumberTitle = styled(Typography, {
  label: 'StyledPhoneNumberTitle',
})(({ theme }) => ({
  fontSize: '.875rem',
  marginTop: theme.spacing(1.5),
}));

export const StyledLabel = styled(Typography, {
  label: 'StyledLabel',
})(({ theme }) => ({
  color: theme.name === 'light' ? '#555' : '#c9cacb',
  fontSize: '.875rem',
  lineHeight: '1',
  marginBottom: '8px',
  marginTop: theme.spacing(2),
  padding: 0,
}));

export const StyledInputContainer = styled(Box, {
  label: 'StyledInputContainer',
})<{ isPhoneInputFocused: boolean }>(({ isPhoneInputFocused, theme }) => ({
  border: theme.name === 'light' ? '1px solid #ccc' : '1px solid #222',
  transition: 'border-color 225ms ease-in-out',
  width: '370px',
  ...(isPhoneInputFocused &&
    (theme.name === 'light'
      ? {
          borderColor: '#3683dc',
          boxShadow: '0 0 2px 1px #e1edfa',
        }
      : {
          borderColor: '#3683dc',
          boxShadow: '0 0 2px 1px #222',
        })),
}));

export const StyledSelect = styled(Autocomplete, {
  label: 'StyledSelect',
})(({ theme }) => ({
  '& .Mui-focused': {
    borderColor: 'unset',
    boxShadow: 'none',
  },
  '& .MuiAutocomplete-endAdornment': {
    position: 'static',
  },
  '& .MuiInputBase-root': {
    border: 'unset',
    color: `${theme.palette.primary.main} !important`,
    opacity: '1 !important',
  },
  // '& .MuiPopper-root-MuiAutocomplete-popper.MuiAutocomplete-popper': {
  //   width: '500px',
  // },
  '&& .MuiAutocomplete-inputRoot': {
    paddingRight: '0px',
  },
  // '&& .MuiPaper-root .MuiPaper-elevation .MuiPaper-rounded .MuiPaper-elevation1 .MuiAutocomplete-paper': {
  //   width: '500px !important',
  // },
  '&& .base-Popper-root .MuiAutocomplete-popper': {
    width: '500px !important',
  },
  '&:focus': {
    borderColor: 'unset',
    boxShadow: 'unset',
  },
  border: 'none',
  font: '20px',
  height: '34px',
}));

export const StyledPhoneNumberInput = styled(TextField, {
  label: 'StyledPhoneNumberInput',
})(() => ({
  '&.Mui-focused': {
    borderColor: 'unset',
    boxShadow: 'none',
  },
  '&:focus': {
    borderColor: 'unset',
    boxShadow: 'unset',
  },
  border: 'unset',
}));

export const StyledFormHelperText = styled(FormHelperText, {
  label: 'StyledFormHelperText',
})(({ theme }) => ({
  alignItems: 'center',
  color: theme.color.red,
  display: 'flex',
  left: 5,
  top: 42,
  width: '100%',
}));

export const StyledButtonContainer = styled(Box, {
  label: 'StyledButtonContainer',
})(({ theme }) => ({
  gap: theme.spacing(),
  [theme.breakpoints.down('md')]: {
    marginTop: theme.spacing(2),
  },
}));
