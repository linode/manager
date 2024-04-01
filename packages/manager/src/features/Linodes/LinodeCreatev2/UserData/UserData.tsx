import React, { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Accordion } from 'src/components/Accordion';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useImageQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { UserDataHeading } from './UserDataHeading';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const UserData = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const regionId = useWatch({ control, name: 'region' });
  const imageId = useWatch({ control, name: 'image' });

  const [formatWarning, setFormatWarning] = React.useState(false);

  const { data: regions } = useRegionsQuery();
  const { data: image } = useImageQuery(imageId ?? '', Boolean(imageId));

  const checkFormat = ({
    hasInputValueChanged,
    userData,
  }: {
    hasInputValueChanged: boolean;
    userData: string;
  }) => {
    const userDataLower = userData.toLowerCase();
    const validPrefixes = ['#cloud-config', 'content-type: text/', '#!/bin/'];
    const isUserDataValid = validPrefixes.some((prefix) =>
      userDataLower.startsWith(prefix)
    );
    setFormatWarning(
      userData.length > 0 && !isUserDataValid && !hasInputValueChanged
    );
  };

  const region = useMemo(() => regions?.find((r) => r.id === regionId), [
    regions,
    regionId,
  ]);

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  if (!region?.capabilities.includes('Metadata')) {
    return null;
  }

  if (!image?.capabilities.includes('cloud-init')) {
    return null;
  }

  return (
    <Accordion heading={<UserDataHeading />} sx={{ m: '0 !important', p: 1 }}>
      <Typography>
        User data is a feature of the Metadata service that enables you to
        perform system configuration tasks (such as adding users and installing
        software) by providing custom instructions or scripts to cloud-init. Any
        user data should be added at this step and cannot be modified after the
        the Linode has been created.{' '}
        <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/metadata/">
          Learn more
        </Link>
        .
      </Typography>
      {formatWarning && (
        <Notice spacingBottom={16} spacingTop={16} variant="warning">
          The user data may be formatted incorrectly.
        </Notice>
      )}
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            onBlur={(e) =>
              checkFormat({
                hasInputValueChanged: false,
                userData: e.target.value,
              })
            }
            onChange={(e) => {
              checkFormat({
                hasInputValueChanged: true,
                userData: e.target.value,
              });
              field.onChange(e);
            }}
            disabled={isLinodeCreateRestricted}
            errorText={fieldState.error?.message}
            expand
            label="User Data"
            labelTooltipText="Compatible formats include cloud-config data and executable scripts."
            multiline
            rows={1}
            value={field.value ?? ''}
          />
        )}
        control={control}
        name="metadata.user_data"
      />
    </Accordion>
  );
};
