import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ClickAwayListener } from 'src/components/ClickAwayListener';
import { IconButton } from 'src/components/IconButton';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { fadeIn } from 'src/styles/keyframes';

import {
  StyledButton,
  StyledEdit,
  StyledEditingContainer,
  StyledTextContainer,
  // StyledTextField,
  StyledTypography,
} from './EditableInput.styles';

export type EditableTextVariant = 'h1' | 'h2' | 'table-cell';

export interface EditableInputProps {
  cancelEdit: () => void;
  className?: string;
  editable?: boolean;
  errorText?: string;
  inputText: string;
  isEditing: boolean;
  loading: boolean;
  onEdit: () => void;
  onInputChange: (text: string) => void;
  openForEdit: () => void;
  text: string;
  typeVariant: EditableTextVariant;
}

type FilteredEditableInputProps = EditableInputProps &
  Omit<TextFieldProps, 'label'>;

export const EditableInput = (props: FilteredEditableInputProps) => {
  const {
    cancelEdit,
    className,
    errorText,
    inputText,
    isEditing,
    loading,
    onEdit,
    onInputChange,
    openForEdit,
    text,
    typeVariant,
    ...rest
  } = props;

  const theme = useTheme();

  /** confirm or cancel edits if the enter or escape keys are pressed, respectively */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEdit();
    }
    if (e.key === 'Escape' || e.key === 'Esc') {
      cancelEdit();
    }
  };

  const labelText = (
    <StyledTypography
      aria-label={text}
      className={className}
      data-qa-editable-text
      variant={typeVariant === 'table-cell' ? 'body1' : 'h1'}
    >
      <strong>{text}</strong>
    </StyledTypography>
  );

  const textFieldStyles = {
    '& .MuiInputBase-input': {
      padding: '5px 8px',
      ...theme.typography.body1,
      ...(props.typeVariant === 'h1' && {
        ...theme.typography.h1,
        color: 'red',
      }),
      ...(props.typeVariant === 'h2' && {
        ...theme.typography.h2,
        color: 'blue',
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
  };

  return !isEditing && !errorText ? (
    <StyledTextContainer className={className} data-testid={'editable-text'}>
      {labelText}
      {/** pencil icon */}
      <StyledButton
        aria-label={`Edit ${text}`}
        data-qa-edit-button
        onClick={openForEdit}
      >
        <StyledEdit />
      </StyledButton>
    </StyledTextContainer>
  ) : (
    <ClickAwayListener mouseEvent="onMouseDown" onClickAway={cancelEdit}>
      <StyledEditingContainer className={className} data-qa-edit-field>
        <TextField
          {...rest}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={true}
          editable
          errorText={errorText}
          hideLabel
          label="Edit Label"
          loading={loading}
          onChange={(e: any) => onInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          sx={textFieldStyles}
          type="text"
          value={inputText}
        />
        {!loading && (
          <>
            <IconButton
              aria-label="Save new label"
              data-qa-save-edit
              onClick={() => onEdit()}
              size="small"
            >
              <Check />
            </IconButton>
            <IconButton
              aria-label="Cancel label edit"
              data-qa-cancel-edit
              onClick={cancelEdit}
              size="small"
            >
              <Close />
            </IconButton>
          </>
        )}
      </StyledEditingContainer>
    </ClickAwayListener>
  );
};
