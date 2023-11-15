import Edit from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Typography } from 'src/components/Typography';

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
