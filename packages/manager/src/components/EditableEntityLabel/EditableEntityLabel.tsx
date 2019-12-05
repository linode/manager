import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon, { Variant } from 'src/components/EntityIcon/EntityIcon';
import Grid from 'src/components/Grid';
import EditableInput from './EditableInput';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: 40
  },
  icon: {
    marginRight: theme.spacing(1)
  },
  smallInput: {
    position: 'relative',
    paddingRight: 20,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    fontSize: 15
  }
}));

interface Props {
  text: string;
  onEdit: (s: string) => Promise<any>;
  iconVariant?: Variant;
  loading: boolean;
  subText?: string;
  status?: string;
}

export const EditableEntityLabel: React.FC<Props> = props => {
  const { iconVariant, loading, status, subText, text, onEdit } = props;
  const [isEditing, toggleEditing] = React.useState<boolean>(false);
  const [inputText, setInputText] = React.useState<string>(text);
  const [error, setError] = React.useState<string | undefined>();
  const classes = useStyles();

  const onSubmit = () => {
    setError(undefined);
    if (inputText !== text) {
      onEdit(inputText)
        .then(() => toggleEditing(false))
        .catch(e => setError(e)); // @todo have to make sure this is passed as a string
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
      justify="flex-start"
      className={`${classes.root} m0`}
    >
      {!isEditing && iconVariant && (
        <Grid item className="py0 px0">
          <EntityIcon
            variant={iconVariant}
            status={status}
            className={classes.icon}
          />
        </Grid>
      )}
      <Grid item className="py0">
        <Grid container direction="column">
          <Grid item className="py0 px0">
            <EditableInput
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
              className={classes.smallInput}
            />
          </Grid>
          {subText && !isEditing && (
            <Grid item className="py0 px0">
              <Typography variant="body2">{subText}</Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default EditableEntityLabel;
