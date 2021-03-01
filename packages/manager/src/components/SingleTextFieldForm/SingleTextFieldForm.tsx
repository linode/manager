import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Notice from 'src/components/Notice';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

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
      {success && <Notice success text={_successMessage} />}
      {generalError && <Notice error text={generalError} />}
      <TextField
        {...textFieldProps}
        label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        errorText={fieldError}
        disabled={disabled}
      />
      <ActionsPanel>
        <Button
          buttonType="primary"
          onClick={handleSubmit}
          loading={submitting}
          disabled={disabled || value === initialValue}
          tooltipText={tooltipText ? tooltipText : undefined}
        >
          Save
        </Button>
      </ActionsPanel>
    </>
  );
};

export default React.memo(SingleTextFieldForm);
