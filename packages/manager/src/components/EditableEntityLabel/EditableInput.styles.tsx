import { Box, Button, fadeIn, TextField, Typography } from '@linode/ui';
import Edit from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';

import type { EditableTextVariant } from './EditableInput';
import type { TextFieldProps } from '@linode/ui';

export const StyledTypography = styled(Typography, {
  label: 'EditableInput__StyledTypography',
})(({ theme, ...props }) => ({
  ...(!props.className && {
    display: 'inline-block',
    lineHeight: 1,
    padding: '5px 8px',
    textDecoration: 'inherit',
    transition: theme.transitions.create(['opacity']),
    wordBreak: 'break-all',
  }),
}));

export const StyledTextContainer = styled(Box, {
  label: 'EditableInput__StyledTextContainer',
})(({ theme }) => ({
  '& svg': {
    [theme.breakpoints.up('sm')]: {
      opacity: 0,
    },
  },
  '&:hover, &:focus': {
    '& svg': {
      '&:hover': {
        color: theme.color.black,
      },
      color: theme.color.grey1,
      opacity: 1,
    },
  },
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-start',
  position: 'relative',
}));

export const StyledButton = styled(Button, {
  label: 'EditableInput__StyledButton',
})(() => ({
  height: 24,
  marginTop: 0,
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
  position: 'absolute',
  right: 10,
  width: 24,
}));

export const StyledEdit = styled(Edit, {
  label: 'EditableInput__StyledEdit',
})(({ theme }) => ({
  '&:hover, &:focus': {
    color: theme.palette.primary.light,
  },
  border: '1px solid transparent',
  color: theme.palette.text.primary,
  fontSize: 22,
  margin: '0 10px',
}));

export const StyledEditingContainer = styled(Box, {
  label: 'EditableInput__StyledEditingContainer',
})(() => ({
  alignItems: 'center',
  border: '1px solid transparent',
  display: 'flex',
  fontSize: 22,
  gap: 2,
  justifyContent: 'flex-start',
  position: 'relative',
}));

interface ExpandedTextField extends TextFieldProps {
  typeVariant: EditableTextVariant;
}

export const StyledTextField = styled(TextField, {
  label: 'EditableInput__StyledTextField',
})<ExpandedTextField>(({ theme, ...props }) => ({
  '& .MuiInputBase-input': {
    padding: '5px 8px',
    ...theme.typography.body1,
    ...(props.typeVariant === 'h1' && {
      ...theme.typography.h1,
    }),
    ...(props.typeVariant === 'h2' && {
      ...theme.typography.h2,
    }),
  },
  '& .MuiInputBase-root': {
    backgroundColor: 'transparent',
    borderColor: `${theme.palette.primary.main} !important`,
    boxShadow: 'none',
    maxWidth: 170,
    minHeight: 40,
    [theme.breakpoints.up('md')]: {
      maxWidth: 415,
      width: '100%',
    },
  },
  animation: `${fadeIn} .3s ease-in-out forwards`,
  margin: 0,
  opacity: 0,
}));
