import React from 'react';
import { useController } from 'react-hook-form';

import { Divider } from 'src/components/Divider';
import { Link } from 'src/components/Link';
import PasswordInput from 'src/components/PasswordInput/PasswordInput';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import {
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
  const isRequired = !userDefinedField.default;

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

  // if (isMultiSelect(userDefinedField)) {
  //   return (
  //     <UserDefinedMultiSelect
  //       error={error}
  //       field={field}
  //       isOptional={isOptional}
  //       key={field.name}
  //       updateFor={[field.label, udf_data[field.name], error]}
  //       updateFormState={handleChange}
  //       value={udf_data[field.name] || ''}
  //     />
  //   );
  // }

  // if (isOneSelect(field)) {
  //   return (
  //     <Grid key={field.name} lg={5} xs={12}>
  //       <UserDefinedSelect
  //         error={error}
  //         field={field}
  //         isOptional={isOptional}
  //         key={field.name}
  //         updateFormState={handleChange}
  //         value={udf_data[field.name] || ''}
  //       />{' '}
  //     </Grid>
  //   );
  // }

  if (isPasswordField(userDefinedField.name)) {
    const isTokenPassword = userDefinedField.name === 'token_password';
    return (
      <PasswordInput
        placeholder={
          isTokenPassword ? 'Enter your token' : userDefinedField.example
        }
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
        onChange={(e) => onChange(userDefinedField.name, e.target.value)}
        required={isRequired}
        tooltipInteractive={isTokenPassword}
        value={field.value[userDefinedField.name] || ''}
      />
    );
  }

  return (
    <TextField
      // errorText={error}
      label={userDefinedField.label}
      onChange={(e) => onChange(userDefinedField.name, e.target.value)}
      placeholder={userDefinedField.example}
      required={isRequired}
      value={field.value[userDefinedField.name] || ''}
    />
  );
};
