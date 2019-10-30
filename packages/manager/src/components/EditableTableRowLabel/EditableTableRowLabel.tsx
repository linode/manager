import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon, { Variant } from 'src/components/EntityIcon/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import EditableInput from './EditableInput';

const useStyles = makeStyles((theme: Theme) => ({
  smallInput: {
    height: '1em'
  },
  subText: {
    fontSize: '0.8em'
  }
}));

interface Props {
  text: string;
  onEdit: (s: string) => Promise<any>;
  width?: string;
  iconVariant: Variant;
  subText?: string;
}

export const EditableTableRowLabel: React.FC<Props> = props => {
  const { iconVariant, subText, text, width, onEdit } = props;
  const [isEditing, toggleEditing] = React.useState<boolean>(false);
  const [inputText, setInputText] = React.useState<string>(text);
  const classes = useStyles();

  const onSubmit = () => {
    onEdit(inputText)
      .then(() => toggleEditing(false))
  }
  return (
    <TableCell style={{ width: width || '30%' }}>
      <Grid
        container
        direction="row"
        wrap="nowrap"
        alignItems="center"
        justify="flex-start"
      >
        {!isEditing && (
          <Grid item xs={2}>
            <EntityIcon variant={iconVariant} />
          </Grid>
        )}
        <Grid
          container
          item
          direction="column"
          alignItems="flex-start"
          justify="center"
          spacing={0}
        >
          <Grid item className="py0 px0">
            <EditableInput
              onEdit={onSubmit}
              onCancel={() => toggleEditing(false)}
              openForEdit={() => toggleEditing(true)}
              cancelEdit={() => toggleEditing(false)}
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
              <Typography variant="body2" className={classes.subText}>
                {subText}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </TableCell>
  );
};

export default EditableTableRowLabel;
