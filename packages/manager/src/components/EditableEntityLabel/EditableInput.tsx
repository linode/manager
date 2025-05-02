import { ClickAwayListener, CloseIcon, IconButton } from '@linode/ui';
import Check from '@mui/icons-material/Check';
import * as React from 'react';

import {
  StyledButton,
  StyledEdit,
  StyledEditingContainer,
  StyledTextContainer,
  StyledTextField,
  StyledTypography,
} from './EditableInput.styles';

import type { TextFieldProps } from '@linode/ui';

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
        <StyledTextField
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
          type="text"
          typeVariant={typeVariant}
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
              <CloseIcon />
            </IconButton>
          </>
        )}
      </StyledEditingContainer>
    </ClickAwayListener>
  );
};
