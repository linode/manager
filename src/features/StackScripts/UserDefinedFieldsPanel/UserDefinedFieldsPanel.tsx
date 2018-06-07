import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
    minHeight: '300px',
  },
});

interface Props {
  userDefinedFields?: Linode.StackScript.UserDefinedField[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserDefinedFieldsPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { userDefinedFields, classes } = props;

  console.log(userDefinedFields);

  const renderField = (field: Linode.StackScript.UserDefinedField) => {
    if (isMultiSelect(field)) {
      return <div key={field.name}>multi select</div>;
    } if (isOneSelect(field)) {
      return <div key={field.name}>one select</div>;
    } if (isPasswordField(field.name)) {
      return <div key={field.name}>password field</div>;
    }
    return <div key={field.name}>text field</div>;
  };

  return (
    <Paper className={classes.root}>
      {
        userDefinedFields!.map((field: Linode.StackScript.UserDefinedField) => {
          return renderField(field);
        })}
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
