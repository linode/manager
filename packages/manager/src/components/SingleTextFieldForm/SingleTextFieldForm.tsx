import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Notice } from 'src/components/Notice/Notice';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

interface Props extends TextFieldProps {
  errorMessage?: string;
  fieldName?: string;
  initialValue?: string;
  submitForm: (value: string) => Promise<any>;
  successCallback?: () => void;
  successMessage?: string;
}

export const SingleTextFieldForm = React.memo((props: Props) => {
  const {
    disabled,
    errorMessage,
    fieldName,
    initialValue,
    label,
    submitForm,
    successCallback,
    successMessage,
    tooltipText,
    trimmed,
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
        sx={(theme) => ({
          [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
          },
        })}
        display="flex"
        justifyContent="space-between"
      >
        <TextField
          {...textFieldProps}
          sx={(theme) => ({
            minWidth: 415,
            [theme.breakpoints.down('md')]: {
              minWidth: 'auto',
            },
          })}
          disabled={disabled}
          errorText={fieldError}
          label={label}
          onBlur={(e) => setValue(e.target.value)}
          onChange={(e) => setValue(e.target.value)}
          tooltipText={tooltipText ? tooltipText : undefined}
          trimmed={trimmed}
          value={value}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: disabled || value === initialValue,
            label: `Update ${label}`,
            loading: submitting,
            onClick: handleSubmit,
            sx: (theme: Theme) => ({
              minWidth: 180,
              [theme.breakpoints.up('md')]: {
                marginTop: 2,
              },
            }),
          }}
        />
      </Box>
      {success ? (
        <Notice
          spacingBottom={8}
          spacingTop={8}
          success
          text={_successMessage}
        />
      ) : null}
      {generalError ? (
        <Notice error spacingBottom={8} spacingTop={8} text={generalError} />
      ) : null}
    </>
  );
});
