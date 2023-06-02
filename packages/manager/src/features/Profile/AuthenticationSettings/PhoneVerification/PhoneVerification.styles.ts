import Box from 'src/components/core/Box';
import FormHelperText from 'src/components/core/FormHelperText';
import Select from 'src/components/EnhancedSelect/Select';
import TextField from 'src/components/TextField';
import Typography from 'src/components/core/Typography';
import { styled } from '@mui/material/styles';

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

export const StyledButtonContainer = styled(Box, {
  label: 'StyledButtonContainer',
})(({ theme }) => ({
  gap: theme.spacing(),
  [theme.breakpoints.down('md')]: {
    marginTop: theme.spacing(2),
  },
}));

export const StyledInputContainer = styled(Box, {
  label: 'StyledInputContainer',
})<{ isPhoneInputFocused: boolean }>(({ theme, isPhoneInputFocused }) => ({
  border: theme.name === 'light' ? '1px solid #ccc' : '1px solid #222',
  width: 'fit-content',
  transition: 'border-color 225ms ease-in-out',
  ...(isPhoneInputFocused &&
    (theme.name === 'light'
      ? {
          boxShadow: '0 0 2px 1px #e1edfa',
          borderColor: '#3683dc',
        }
      : {
          boxShadow: '0 0 2px 1px #222',
          borderColor: '#3683dc',
        })),
}));

export const StyledPhoneNumberInput = styled(TextField, {
  label: 'StyledPhoneNumberInput',
})(() => ({
  minWidth: '300px',
  border: 'unset',
  '&:focus': {
    boxShadow: 'unset',
    borderColor: 'unset',
  },
  '&.Mui-focused': {
    boxShadow: 'none',
    borderColor: 'unset',
  },
}));

export const StyledSelect = styled(Select, {
  label: 'StyledSelect',
})(({ theme }) => ({
  width: '70px !important',
  height: '34px',
  border: 'unset',
  '&:focus': {
    boxShadow: 'unset',
    borderColor: 'unset',
  },
  '&.Mui-focused': {
    boxShadow: 'none',
    borderColor: 'unset',
  },
  '& .MuiInputBase-input .react-select__indicators svg': {
    color: `${theme.palette.primary.main} !important`,
    opacity: '1 !important',
  },
}));

export const StyledLabel = styled(Typography, {
  label: 'StyledLabel',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.name === 'light' ? '#555' : '#c9cacb',
  padding: 0,
  fontSize: '.875rem',
  fontWeight: 400,
  lineHeight: '1',
  marginBottom: '8px',
  fontFamily: 'LatoWebBold',
}));

export const StyledFormHelperText = styled(FormHelperText, {
  label: 'StyledFormHelperText',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.color.red,
  top: 42,
  left: 5,
  width: '100%',
}));
