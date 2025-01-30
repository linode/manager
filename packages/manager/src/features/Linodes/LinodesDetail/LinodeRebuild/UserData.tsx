import { Accordion, Notice, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { useImageQuery } from 'src/queries/images';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useRegionQuery } from 'src/queries/regions/regions';

import type { RebuildLinodeFormValues } from './utils';

interface Props {
  linodeId: number;
}

export const UserData = (props: Props) => {
  const { control } = useFormContext<RebuildLinodeFormValues>();

  const imageId = useWatch({ control, name: 'image' });

  const [formatWarning, setFormatWarning] = React.useState(false);

  const { data: linode } = useLinodeQuery(props.linodeId);
  const { data: region } = useRegionQuery(linode?.region ?? '');
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

  if (!region?.capabilities.includes('Metadata')) {
    return null;
  }

  if (!image?.capabilities.includes('cloud-init')) {
    return null;
  }

  return (
    <Accordion
      detailProps={{ sx: { p: 0 } }}
      heading="Add User Data"
      summaryProps={{ sx: { p: 0 } }}
    >
      <Notice spacingBottom={16} spacingTop={0} variant="success">
        Adding new user data is recommended as part of the rebuild process.
      </Notice>
      <Typography>
        User data is a feature of the Metadata service that enables you to
        perform system configuration tasks (such as adding users and installing
        software) by providing custom instructions or scripts to cloud-init. Any
        user data should be added at this step and cannot be modified after the
        the Linode has been created.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/overview-of-the-metadata-service">
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
            onBlur={(e) => {
              field.onBlur();
              checkFormat({
                hasInputValueChanged: false,
                userData: e.target.value,
              });
            }}
            onChange={(e) => {
              field.onChange(e);
              checkFormat({
                hasInputValueChanged: true,
                userData: e.target.value,
              });
            }}
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
