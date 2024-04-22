import React from 'react';
import { useController } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Divider } from 'src/components/Divider';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import PasswordInput from 'src/components/PasswordInput/PasswordInput';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import {
  getIsUDFRequired,
  isHeader,
  isMultiSelect,
  isOneSelect,
  isPasswordField,
} from './utilities';

import type { CreateLinodeRequest, UserDefinedField } from '@linode/api-v4';

interface Props {
  userDefinedField: UserDefinedField;
}

export const UserDefinedFieldInput = ({ userDefinedField }: Props) => {
  const isRequired = getIsUDFRequired(userDefinedField);

  const { field } = useController<CreateLinodeRequest, 'stackscript_data'>({
    name: 'stackscript_data',
  });

  const onChange = (key: string, value: string) => {
    field.onChange({
      ...field.value,
      [key]: value,
    });
  };

  if (isHeader(userDefinedField)) {
    return (
      <Stack>
        <Divider />
        <Typography variant="h3">{userDefinedField.label}</Typography>
      </Stack>
    );
  }

  if (isMultiSelect(userDefinedField)) {
    return (
      <Autocomplete
        onChange={(e, options) =>
          onChange(userDefinedField.name, options.join(','))
        }
        textFieldProps={{
          required: isRequired,
        }}
        // errorText={error}
        label={userDefinedField.label}
        multiple
        noMarginTop
        options={userDefinedField.manyof!.split(',') ?? []}
        value={field.value[userDefinedField.name] ?? null}
      />
    );
  }

  if (isOneSelect(userDefinedField)) {
    const options = userDefinedField
      .oneof!.split(',')
      .map((option) => ({ label: option }));

    if (options.length > 4) {
      return (
        <Autocomplete
          onChange={(_, option) =>
            onChange(userDefinedField.name, option?.label ?? '')
          }
          value={options.find(
            (option) => option.label === field.value[userDefinedField.name]
          )}
          disableClearable={isRequired}
          label={userDefinedField.label}
          options={options}
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
              checked={option.label === field.value[userDefinedField.name]}
              control={<Radio />}
              key={option.label}
              label={option.label}
              onChange={(e) => onChange(userDefinedField.name, option.label)}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  if (isPasswordField(userDefinedField.name)) {
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
        // errorText={error}
        label={userDefinedField.label}
        noMarginTop
        onChange={(e) => onChange(userDefinedField.name, e.target.value)}
        placeholder={isTokenPassword ? 'Enter your token' : 'Enter a password.'}
        required={isRequired}
        tooltipInteractive={isTokenPassword}
        value={field.value[userDefinedField.name] || ''}
      />
    );
  }

  return (
    <TextField
      helperText={userDefinedField.example}
      label={userDefinedField.label}
      // errorText={error}
      noMarginTop
      onChange={(e) => onChange(userDefinedField.name, e.target.value)}
      required={isRequired}
      value={field.value[userDefinedField.name] || ''}
    />
  );
};
