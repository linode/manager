import * as React from 'react';
import { useTheme, styled } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import type { EntityVariants } from 'src/components/EntityIcon/EntityIcon';
import Grid from '@mui/material/Unstable_Grid2';
import EditableInput from './EditableInput';

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
      alignItems="center"
      justifyContent="flex-start"
      sx={{
        margin: 0,
        minHeight: '40px',
      }}
    >
      {!isEditing && iconVariant && (
        <Grid className="py0 px0">
          <EntityIcon
            variant={iconVariant}
            status={status}
            style={{
              marginRight: theme.spacing(1),
            }}
          />
        </Grid>
      )}
      <Grid className="py0">
        <Grid container>
          <Grid className="py0 px0">
            <StyledEditableInput
              errorText={error}
              loading={loading}
              onEdit={onSubmit}
              openForEdit={handleOpen}
              cancelEdit={handleClose}
              onInputChange={(t: string) => setInputText(t)}
              text={text}
              inputText={inputText}
              isEditing={isEditing}
              typeVariant="table-cell"
            />
          </Grid>
          {subText && !isEditing && (
            <Grid xs={12} className="py0 px0">
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
