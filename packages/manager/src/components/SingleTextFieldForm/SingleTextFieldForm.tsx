import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  input: {
    minWidth: 415,
    [theme.breakpoints.down('sm')]: {
      minWidth: 'auto',
    },
  },
  button: {
    minWidth: 180,
    [theme.breakpoints.up('md')]: {
      marginTop: 16,
    },
  },
}));

export interface Props {
  label: string;
  fieldName?: string;
  submitForm: (value: string) => Promise<any>;
  initialValue?: string;
  disabled?: boolean;
  tooltipText?: string;
  successMessage?: string;
  errorMessage?: string;
  successCallback?: () => void;
}

export const SingleTextFieldForm: React.FC<Props & TextFieldProps> = (
  props
) => {
  const classes = useStyles();

  const {
    label,
    fieldName,
    submitForm,
    disabled,
    tooltipText,
    successMessage,
    errorMessage,
    successCallback,
    initialValue,
    ...textFieldProps
  } = props;

  const _fieldName = fieldName ?? label.toLowerCase();
  const _successMessage = successMessage ?? `${label} updated successfully.`;
  const _errorMessage = errorMessage ?? `Error updating ${label}.`;

  const [value, setValue] = React.useState(initialValue ?? '');
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setSuccess(false);
    setErrors(undefined);

    submitForm(value)
      .then(() => {
        setSubmitting(false);
        setSuccess(true);
        if (successCallback) {
          successCallback();
        }
      })
      .catch((err) => {
        setSubmitting(false);
        setErrors(getAPIErrorOrDefault(err, _errorMessage));
      });
  };

  const errorMap = getErrorMap([_fieldName], errors);
  const fieldError = errorMap[_fieldName];
  const generalError = errorMap.none;

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        className={classes.root}
      >
        <TextField
          {...textFieldProps}
          className={classes.input}
          label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          errorText={fieldError}
          tooltipText={tooltipText ? tooltipText : undefined}
        />
        <ActionsPanel>
          <Button
            className={classes.button}
            buttonType="primary"
            onClick={handleSubmit}
            disabled={disabled || value === initialValue}
            loading={submitting}
          >
            Update {label}
          </Button>
        </ActionsPanel>
      </Box>
      {success ? (
        <Notice
          success
          text={_successMessage}
          spacingTop={8}
          spacingBottom={8}
        />
      ) : null}
      {generalError ? (
        <Notice error text={generalError} spacingTop={8} spacingBottom={8} />
      ) : null}
    </>
  );
};

export default React.memo(SingleTextFieldForm);
