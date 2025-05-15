import {
  Autocomplete,
  Box,
  FormHelperText,
  omittedProps,
  TextField,
  Typography,
} from '@linode/ui';
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

export const StyledLabel = styled(Typography, {
  label: 'StyledLabel',
})(({ theme }) => ({
  color:
    theme.name === 'light'
      ? theme.tokens.color.Neutrals[80]
      : theme.tokens.color.Neutrals[40],
  fontSize: '.875rem',
  lineHeight: '1',
  marginBottom: '8px',
  marginTop: theme.spacing(2),
  padding: 0,
}));

export const StyledInputContainer = styled(Box, {
  label: 'StyledInputContainer',
  shouldForwardProp: omittedProps(['isPhoneInputFocused']),
})<{ isPhoneInputFocused: boolean }>(({ isPhoneInputFocused, theme }) => ({
  backgroundColor:
    theme.name === 'dark' ? theme.tokens.color.Neutrals[90] : undefined,
  border:
    theme.name === 'light'
      ? `1px solid ${theme.tokens.color.Neutrals[40]}`
      : `1px solid ${theme.tokens.color.Neutrals.Black}`,
  transition: 'border-color 225ms ease-in-out',
  width: 'fit-content',
  ...(isPhoneInputFocused &&
    (theme.name === 'light'
      ? {
          borderColor: theme.tokens.color.Ultramarine[70],
          boxShadow: `0 0 2px 1px ${theme.tokens.color.Ultramarine[20]}`,
        }
      : {
          borderColor: theme.tokens.color.Ultramarine[70],
          boxShadow: `0 0 2px 1px ${theme.tokens.color.Neutrals.Black}`,
        })),
}));

export const StyledISOCodeSelect = styled(Autocomplete, {
  label: 'StyledISOCodeSelect',
})(({ theme }) => ({
  '& div.Mui-focused': {
    borderColor: 'unset',
    boxShadow: 'none',
  },
  '& div.MuiAutocomplete-inputRoot': {
    border: 'unset',
  },
  '&& .MuiInputBase-root svg': {
    color: `${theme.palette.primary.main}`,
    opacity: '1',
  },
  '&:focus': {
    borderColor: 'unset',
    boxShadow: 'unset',
  },
  height: '34px',
  width: '70px !important',
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
  minWidth: '300px',
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
