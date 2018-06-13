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

import RenderGuard from 'src/components/RenderGuard';
import Notice from 'src/components/Notice';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
    minHeight: '300px',
  },
});

interface Props {
  errors?: Linode.ApiFieldError[];
  userDefinedFields?: Linode.StackScript.UserDefinedField[];
  handleChange: (key: string, value: any) => void;
  udf_data: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserDefinedFieldsPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { userDefinedFields, classes, handleChange } = props;

  const renderField = (field: Linode.StackScript.UserDefinedField) => {
    if (isMultiSelect(field)) {
      return <UserDefinedMultiSelect
        key={field.name}
        field={field}
        udf_data={props.udf_data}
        updateFormState={handleChange}
      />;
    } if (isOneSelect(field)) {
      return <UserDefinedSelect
        field={field}
        updateFormState={handleChange}
        udf_data={props.udf_data}
        key={field.name} />;
    } if (isPasswordField(field.name)) {
      return <UserDefinedText
        key={field.name}
        updateFormState={handleChange}
        isPassword={true}
        field={field}
        udf_data={props.udf_data}
      />;
    }
    return <UserDefinedText
      key={field.name}
      updateFormState={handleChange}
      field={field}
      udf_data={props.udf_data}
    />;
  };

  return (
    <Paper className={classes.root}>
      {props.errors && props.errors.map((error) => {
        return (
          <Notice
            key={error.reason}
            text={error.reason}
            error={true}
          />
        );
      })}
      <Typography variant="title">
        Required Fields
              </Typography>
      {
        userDefinedFields!.map((field: Linode.StackScript.UserDefinedField) => {
          return renderField(field);
        })
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

export default styled(RenderGuard<CombinedProps>(UserDefinedFieldsPanel));
