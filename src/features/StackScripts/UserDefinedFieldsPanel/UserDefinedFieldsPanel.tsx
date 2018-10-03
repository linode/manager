import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';

import UserDefinedMultiSelect from './FieldTypes/UserDefinedMultiSelect';
import UserDefinedSelect from './FieldTypes/UserDefinedSelect';
import UserDefinedText from './FieldTypes/UserDefinedText';

type ClassNames = 'root' | 'username';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    '& > div:last-child': {
      border: 0,
      marginBottom: 0,
      paddingBottom: 0,
    },
  },
  username: {
    color: theme.color.grey1,
  },
});

interface Props {
  errors?: Linode.ApiFieldError[];
  userDefinedFields?: Linode.StackScript.UserDefinedField[];
  handleChange: (key: string, value: any) => void;
  udf_data: any;
  selectedLabel: string;
  selectedUsername: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserDefinedFieldsPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { userDefinedFields, classes, handleChange } = props;

  const renderField = (field: Linode.StackScript.UserDefinedField) => {
    // if the 'default' key is returned from the API, the field is optional
    const isOptional = field.hasOwnProperty('default');
    if (isMultiSelect(field)) {
      return <UserDefinedMultiSelect
        key={field.name}
        field={field}
        udf_data={props.udf_data}
        updateFormState={handleChange}
        updateFor={[props.udf_data[field.name]]}
        isOptional={isOptional}
      />;
    } if (isOneSelect(field)) {
      return <UserDefinedSelect
        field={field}
        updateFormState={handleChange}
        udf_data={props.udf_data}
        updateFor={[props.udf_data[field.name]]}
        isOptional={isOptional}
        key={field.name} />;
    } if (isPasswordField(field.name)) {
      return <UserDefinedText
        key={field.name}
        updateFormState={handleChange}
        isPassword={true}
        field={field}
        udf_data={props.udf_data}
        updateFor={[props.udf_data[field.name]]}
        isOptional={isOptional}
        placeholder={field.example}
      />;
    }
    return <UserDefinedText
      key={field.name}
      updateFormState={handleChange}
      field={field}
      udf_data={props.udf_data}
      updateFor={[props.udf_data[field.name]]}
      isOptional={isOptional}
      placeholder={field.example}
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
      <Typography role="header" variant="title" data-qa-user-defined-field-header>
        <span className={classes.username}>{`${props.selectedUsername} / `}</span>
        <span>{`${props.selectedLabel} Options`}</span>
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
