import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import ShowMoreExpansion from 'src/components/ShowMoreExpansion';
import UserDefinedMultiSelect from './FieldTypes/UserDefinedMultiSelect';
import UserDefinedSelect from './FieldTypes/UserDefinedSelect';
import UserDefinedText from './FieldTypes/UserDefinedText';

type ClassNames = 'root' | 'username' | 'optionalFieldWrapper';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    '& > div:last-child': {
      border: 0,
      marginBottom: 0,
      paddingBottom: 0
    }
  },
  username: {
    color: theme.color.grey1
  },
  optionalFieldWrapper: {}
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

const UserDefinedFieldsPanel: React.StatelessComponent<
  CombinedProps
> = props => {
  const { userDefinedFields, classes, handleChange } = props;

  const renderField = (
    field: Linode.StackScript.UserDefinedField,
    error?: string
  ) => {
    // if the 'default' key is returned from the API, the field is optional
    const isOptional = field.hasOwnProperty('default');
    if (isMultiSelect(field)) {
      return (
        <Grid item xs={12}>
          <UserDefinedMultiSelect
            key={field.name}
            field={field}
            udf_data={props.udf_data}
            updateFormState={handleChange}
            updateFor={[props.udf_data[field.name], error]}
            isOptional={isOptional}
            error={error}
          />
        </Grid>
      );
    }
    if (isOneSelect(field)) {
      return (
        <Grid item xs={12}>
          <UserDefinedSelect
            field={field}
            updateFormState={handleChange}
            udf_data={props.udf_data}
            updateFor={[props.udf_data[field.name], error]}
            isOptional={isOptional}
            key={field.name}
            error={error}
          />{' '}
        </Grid>
      );
    }
    if (isPasswordField(field.name)) {
      return (
        <Grid item xs={12} sm={6} md={4}>
          <UserDefinedText
            key={field.name}
            updateFormState={handleChange}
            isPassword={true}
            field={field}
            udf_data={props.udf_data}
            updateFor={[props.udf_data[field.name], error]}
            isOptional={isOptional}
            placeholder={field.example}
            error={error}
          />
        </Grid>
      );
    }
    return (
      <Grid item xs={12} sm={6} md={4}>
        <UserDefinedText
          key={field.name}
          updateFormState={handleChange}
          field={field}
          udf_data={props.udf_data}
          updateFor={[props.udf_data[field.name], error]}
          isOptional={isOptional}
          placeholder={field.example}
          error={error}
        />
      </Grid>
    );
  };

  return (
    <Paper className={classes.root}>
      <Typography role="header" variant="h2" data-qa-user-defined-field-header>
        <span>{`${props.selectedLabel} Options`}</span>
      </Typography>

      {/* Required Fields */}
      {userDefinedFields!
        .filter(
          (field: Linode.StackScript.UserDefinedField) =>
            field.hasOwnProperty('default') !== true
        )
        .map((field: Linode.StackScript.UserDefinedField) => {
          const error = getError(field, props.errors);
          return renderField(field, error);
        })}

      {/* Optional Fields */}
      <ShowMoreExpansion name="Show Advanced Options">
        <Typography variant="body1">
          These fields are additional configuration options and are not required
          for creation.
        </Typography>
        <div className={`${classes.optionalFieldWrapper} optionalFieldWrapper`}>
          <Grid container alignItems="center">
            {userDefinedFields!
              .filter(
                (field: Linode.StackScript.UserDefinedField) =>
                  field.hasOwnProperty('default') === true
              )
              .map((field: Linode.StackScript.UserDefinedField) => {
                const error = getError(field, props.errors);
                return renderField(field, error);
              })}
          </Grid>
        </div>
      </ShowMoreExpansion>
    </Paper>
  );
};

const getError = (
  field: Linode.StackScript.UserDefinedField,
  errors?: Linode.ApiFieldError[]
) => {
  if (!errors) {
    return;
  }
  const error = errors.find(thisError => thisError.field === field.name);
  return error ? error.reason.replace('the UDF', '') : undefined;
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

const styled = withStyles(styles);

export default styled(RenderGuard<CombinedProps>(UserDefinedFieldsPanel));
