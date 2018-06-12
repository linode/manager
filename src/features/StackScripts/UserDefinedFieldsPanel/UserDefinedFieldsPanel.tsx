import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import UserDefinedText from './FieldTypes/UserDefinedText';
import UserDefinedMultiSelect from './FieldTypes/UserDefinedMultiSelect';
import UserDefinedSelect from './FieldTypes/UserDefinedSelect';
import { StateToUpdate as FormState } from '../../linodes/LinodesCreate';


type ClassNames = 'root' | 'captionEmpty';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
    minHeight: '300px',
  },
  captionEmpty: {
    paddingTop: theme.spacing.unit * 5,
  },
});

interface Props {
  userDefinedFields?: Linode.StackScript.UserDefinedField[];
  updateFormState: (stateToUpdate: FormState[]) => void;
  udf_data: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserDefinedFieldsPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { userDefinedFields, classes, updateFormState } = props;

  const renderEmptyState = () => {
    return <Typography className={classes.captionEmpty} align="center" variant="caption">
      Nothing to see here...
    </Typography>;
  };

  const renderField = (field: Linode.StackScript.UserDefinedField) => {
    if (isMultiSelect(field)) {
      return <UserDefinedMultiSelect
        key={field.name}
        field={field}
        udf_data={props.udf_data}
        updateFormState={updateFormState}
      />;
    } if (isOneSelect(field)) {
      return <UserDefinedSelect
        field={field}
        updateFormState={updateFormState}
        udf_data={props.udf_data}
        key={field.name} />;
    } if (isPasswordField(field.name)) {
      return <UserDefinedText
        key={field.name}
        updateFormState={updateFormState}
        isPassword={true}
        field={field}
        udf_data={props.udf_data}
      />;
    }
    return <UserDefinedText
      key={field.name}
      updateFormState={updateFormState}
      field={field}
      udf_data={props.udf_data}
    />;
  };

  return (
    <Paper className={classes.root}>
      {
        userDefinedFields && userDefinedFields.length > 0
          ? userDefinedFields!.map((field: Linode.StackScript.UserDefinedField) => {
            return renderField(field);
          })
          : renderEmptyState()
      }
    </Paper>
  );
};

const isPasswordField = (udfName: string) => {
  return udfName.toLowerCase().includes('password');
};

const isOneSelect = (udf: Linode.StackScript.UserDefinedField) => {
  return !!udf.oneof; // if we have a oneof prop, it's a radio button
};

const isMultiSelect = (udf: Linode.StackScript.UserDefinedField) => {
  return !!udf.manyof; // if we have a manyof prop, it's a checkbox
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserDefinedFieldsPanel);
