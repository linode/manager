import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

interface Props extends TextFieldProps {
  fieldName?: string;
  submitForm: (value: string) => Promise<any>;
  initialValue?: string;
  successMessage?: string;
  errorMessage?: string;
  successCallback?: () => void;
}

export const SingleTextFieldForm = React.memo((props: Props) => {
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
        sx={(theme) => ({
          [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
          },
        })}
      >
        <TextField
          {...textFieldProps}
          sx={(theme) => ({
            minWidth: 415,
            [theme.breakpoints.down('md')]: {
              minWidth: 'auto',
            },
          })}
          label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          errorText={fieldError}
          tooltipText={tooltipText ? tooltipText : undefined}
        />
        <ActionsPanel>
          <Button
            sx={(theme) => ({
              minWidth: 180,
              [theme.breakpoints.up('md')]: {
                marginTop: 2,
              },
            })}
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
});
