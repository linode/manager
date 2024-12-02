import {
  Divider,
  FormControl,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import PasswordInput from 'src/components/PasswordInput/PasswordInput';

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

  const { field } = useController<CreateLinodeRequest>({
    control,
    name: `stackscript_data.${userDefinedField.name}`,
  });

  // @ts-expect-error UDFs don't abide by the form's error type.
  const error = formState.errors?.[userDefinedField.name]?.message?.replace(
    'the UDF',
    ''
  );
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
        onChange={(e, options) => {
          field.onChange(options.map((option) => option.label).join(','));
        }}
        textFieldProps={{
          required: isRequired,
        }}
        errorText={error}
        label={userDefinedField.label}
        multiple
        noMarginTop
        options={options}
        // If options are selected, hide the placeholder
        placeholder={value.length > 0 ? ' ' : undefined}
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
          textFieldProps={{
            required: isRequired,
          }}
          disableClearable
          label={userDefinedField.label}
          onChange={(_, option) => field.onChange(option?.label ?? '')}
          options={options}
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
        tooltipText={
          isTokenPassword ? (
            <>
              {' '}
              To create an API token, go to{' '}
              <Link to="/profile/tokens">your profile.</Link>
            </>
          ) : undefined
        }
        errorText={error}
        label={userDefinedField.label}
        noMarginTop
        onChange={(e) => field.onChange(e.target.value)}
        placeholder={isTokenPassword ? 'Enter your token' : 'Enter a password.'}
        required={isRequired}
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
