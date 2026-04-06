import {
  Autocomplete,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';

import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { PasswordInput } from 'src/components/PasswordInput/PasswordInput';

import {
  getIsUDFHeader,
  getIsUDFMultiSelect,
  getIsUDFPasswordField,
  getIsUDFRequired,
  getIsUDFSingleSelect,
} from './utilities';

import type { CreateLinodeRequest, UserDefinedField } from '@linode/api-v4';

interface Props {
  userDefinedField: UserDefinedField;
}

export const UserDefinedFieldInput = ({ userDefinedField }: Props) => {
  const isRequired = getIsUDFRequired(userDefinedField);

  const { control, formState } = useFormContext<CreateLinodeRequest>();

  const { field, fieldState } = useController<CreateLinodeRequest>({
    control,
    name: `stackscript_data.${userDefinedField.name}`,
  });

  // @ts-expect-error UDFs don't abide by the form's error type. This is an api-v4 bug.
  const apiError = formState.errors?.[userDefinedField.name] as
    | FieldError
    | undefined;

  const error = (apiError ?? fieldState.error)?.message?.replace('the UDF', '');

  // We might be able to fix this by checking the message for "UDF" and fixing the key
  // when we put the error message in the react hook form state.

  if (getIsUDFHeader(userDefinedField)) {
    return (
      <Stack>
        <Divider />
        <Typography variant="h3">{userDefinedField.label}</Typography>
      </Stack>
    );
  }

  if (getIsUDFMultiSelect(userDefinedField)) {
    const options = userDefinedField
      .manyof!.split(',')
      .map((option) => ({ label: option }));

    const value = options.filter((option) =>
      field.value?.split(',').includes(option.label)
    );

    return (
      <Autocomplete
        errorText={error}
        label={userDefinedField.label}
        multiple
        noMarginTop
        onChange={(e, options) => {
          field.onChange(options.map((option) => option.label).join(','));
        }}
        options={options}
        // If options are selected, hide the placeholder
        placeholder={value.length > 0 ? ' ' : undefined}
        textFieldProps={{
          required: isRequired,
        }}
        value={value}
      />
    );
  }

  if (getIsUDFSingleSelect(userDefinedField)) {
    const options = userDefinedField
      .oneof!.split(',')
      .map((option) => ({ label: option }));

    const value = options.find((option) => option.label === field.value);

    if (options.length > 4) {
      return (
        <Autocomplete
          disableClearable
          label={userDefinedField.label}
          onChange={(_, option) => field.onChange(option?.label ?? '')}
          options={options}
          textFieldProps={{
            required: isRequired,
          }}
          value={value}
        />
      );
    }

    return (
      <FormControl>
        <FormLabel id={`${userDefinedField.name}-radio-group`} sx={{ mb: 0 }}>
          {userDefinedField.label}
        </FormLabel>
        <RadioGroup
          aria-labelledby={`${userDefinedField.name}-radio-group`}
          sx={{ mb: '0 !important' }}
        >
          {options.map((option) => (
            <FormControlLabel
              checked={option.label === field.value}
              control={<Radio />}
              key={option.label}
              label={option.label}
              onChange={() => field.onChange(option.label)}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  if (getIsUDFPasswordField(userDefinedField)) {
    const isTokenPassword = userDefinedField.name === 'token_password';
    return (
      <PasswordInput
        errorText={error}
        label={userDefinedField.label}
        noMarginTop
        onChange={(e) => field.onChange(e.target.value)}
        placeholder={isTokenPassword ? 'Enter your token' : 'Enter a password.'}
        required={isRequired}
        tooltipText={
          isTokenPassword ? (
            <>
              {' '}
              To create an API token, go to{' '}
              <Link to="/profile/tokens">your profile.</Link>
            </>
          ) : undefined
        }
        value={field.value ?? ''}
      />
    );
  }

  return (
    <TextField
      errorText={error}
      helperText={userDefinedField.example}
      label={userDefinedField.label}
      noMarginTop
      onChange={(e) => field.onChange(e.target.value)}
      required={isRequired}
      value={field.value ?? ''}
    />
  );
};
