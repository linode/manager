import { Typography } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';

import { EditableInput } from './EditableInput';

import type { EntityVariants } from 'src/components/EntityIcon/EntityIcon';

interface EditableEntityLabelProps {
  iconVariant?: EntityVariants;
  loading: boolean;
  onEdit: (s: string) => Promise<any>;
  status?: string;
  subText?: string;
  text: string;
}

export const EditableEntityLabel = (props: EditableEntityLabelProps) => {
  const { iconVariant, loading, onEdit, status, subText, text } = props;
  const [isEditing, toggleEditing] = React.useState<boolean>(false);
  const [inputText, setInputText] = React.useState<string>(text);
  const [error, setError] = React.useState<string | undefined>();
  const theme = useTheme();

  const onSubmit = () => {
    setError(undefined);
    if (inputText !== text) {
      onEdit(inputText)
        .then(() => toggleEditing(false))
        .catch((e) => setError(e.toString()));
    } else {
      toggleEditing(false);
    }
  };

  const handleClose = () => {
    toggleEditing(false);
    setError(undefined);
  };

  const handleOpen = () => {
    setInputText(text);
    toggleEditing(true);
  };

  return (
    <Grid
      container
      direction="row"
      wrap="nowrap"
      sx={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        margin: 0,
        minHeight: '40px',
      }}
    >
      {!isEditing && iconVariant && (
        <Grid className="py0 px0">
          <EntityIcon
            style={{
              marginRight: theme.spacing(1),
            }}
            status={status}
            variant={iconVariant}
          />
        </Grid>
      )}
      <Grid className="py0">
        <Grid container>
          <Grid className="py0 px0">
            <StyledEditableInput
              cancelEdit={handleClose}
              errorText={error}
              inputText={inputText}
              isEditing={isEditing}
              loading={loading}
              onEdit={onSubmit}
              onInputChange={(t: string) => setInputText(t)}
              openForEdit={handleOpen}
              text={text}
              typeVariant="table-cell"
            />
          </Grid>
          {subText && !isEditing && (
            <Grid className="py0 px0" size={12}>
              <Typography variant="body1">{subText}</Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

const StyledEditableInput = styled(EditableInput)(() => ({
  fontSize: 15,
  paddingRight: 20,
  position: 'relative',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}));
