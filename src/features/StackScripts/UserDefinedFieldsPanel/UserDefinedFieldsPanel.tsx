import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import ShowMoreExpansion from 'src/components/ShowMoreExpansion';
import UserDefinedMultiSelect from './FieldTypes/UserDefinedMultiSelect';
import UserDefinedSelect from './FieldTypes/UserDefinedSelect';
import UserDefinedText from './FieldTypes/UserDefinedText';

type ClassNames =
  | 'root'
  | 'username'
  | 'advDescription'
  | 'optionalFieldWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      marginBottom: theme.spacing(3),
      '& > div:last-child': {
        border: 0,
        marginBottom: 0,
        paddingBottom: 0
      }
    },
    advDescription: {
      margin: `${theme.spacing(2)}px 0`
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

class UserDefinedFieldsPanel extends React.PureComponent<CombinedProps> {
  renderField = (
    field: Linode.StackScript.UserDefinedField,
    error?: string
  ) => {
    const { udf_data, handleChange } = this.props;
    // if the 'default' key is returned from the API, the field is optional
    const isOptional = field.hasOwnProperty('default');
    if (isMultiSelect(field)) {
      return (
        <Grid item xs={12} lg={5} key={field.name}>
          <UserDefinedMultiSelect
            key={field.name}
            field={field}
            udf_data={udf_data}
            updateFormState={handleChange}
            updateFor={[udf_data[field.name], error]}
            isOptional={isOptional}
            error={error}
          />
        </Grid>
      );
    }
    if (isOneSelect(field)) {
      return (
        <Grid item xs={12} lg={5} key={field.name}>
          <UserDefinedSelect
            field={field}
            updateFormState={handleChange}
            udf_data={udf_data}
            updateFor={[udf_data[field.name], error]}
            isOptional={isOptional}
            key={field.name}
            error={error}
          />{' '}
        </Grid>
      );
    }
    if (isPasswordField(field.name)) {
      return (
        <Grid item xs={12} lg={5} key={field.name}>
          <UserDefinedText
            updateFormState={handleChange}
            isPassword={true}
            field={field}
            udf_data={udf_data}
            updateFor={[udf_data[field.name], error]}
            isOptional={isOptional}
            placeholder={field.example}
            error={error}
          />
        </Grid>
      );
    }
    return (
      <Grid item xs={12} lg={5} key={field.name}>
        <UserDefinedText
          updateFormState={handleChange}
          field={field}
          udf_data={udf_data}
          updateFor={[udf_data[field.name], error]}
          isOptional={isOptional}
          placeholder={field.example}
          error={error}
        />
      </Grid>
    );
  };

  render() {
    const { userDefinedFields, classes } = this.props;

    const [requiredUDFs, optionalUDFs] = seperateUDFsByRequiredStatus(
      userDefinedFields!
    );

    return (
      <Paper className={classes.root}>
        <Typography variant="h2" data-qa-user-defined-field-header>
          <span>{`${this.props.selectedLabel} Options`}</span>
        </Typography>

        {/* Required Fields */}
        {requiredUDFs.map((field: Linode.StackScript.UserDefinedField) => {
          const error = getError(field, this.props.errors);
          return this.renderField(field, error);
        })}

        {/* Optional Fields */}
        {optionalUDFs.length !== 0 && (
          <ShowMoreExpansion name="Advanced Options" defaultExpanded={true}>
            <Typography variant="body1" className={classes.advDescription}>
              These fields are additional configuration options and are not
              required for creation.
            </Typography>
            <div
              className={`${classes.optionalFieldWrapper} optionalFieldWrapper`}
            >
              {optionalUDFs.map(
                (field: Linode.StackScript.UserDefinedField) => {
                  const error = getError(field, this.props.errors);
                  return this.renderField(field, error);
                }
              )}
            </div>
          </ShowMoreExpansion>
        )}
      </Paper>
    );
  }
}

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

/**
 * Used to separate required UDFs from non-required ones
 *
 * @return nested array [[...requiredUDFs], [...nonRequiredUDFs]]
 */
const seperateUDFsByRequiredStatus = (
  udfs: Linode.StackScript.UserDefinedField[]
) => {
  return udfs.reduce(
    (accum, eachUDF) => {
      /**
       * if the "default" key exists, it's optional
       */
      if (eachUDF.hasOwnProperty('default')) {
        return [[...accum[0]], [...accum[1], eachUDF]];
      } else {
        return [[...accum[0], eachUDF], [...accum[1]]];
      }
    },
    [[], []]
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  styled
)(UserDefinedFieldsPanel);
