import { useImageQuery, useRegionQuery } from '@linode/queries';
import { Accordion, Checkbox, Notice, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';

import type { RebuildLinodeFormValues } from './utils';
import type { Linode } from '@linode/api-v4';

interface Props {
  disabled: boolean;
  linode: Linode;
}

export const UserData = (props: Props) => {
  const { linode, disabled: isReadOnly } = props;
  const { control } = useFormContext<RebuildLinodeFormValues>();

  const [imageId, reuseUserData] = useWatch({
    control,
    name: ['image', 'reuseUserData'],
  });

  const [formatWarning, setFormatWarning] = React.useState(false);

  const { data: region } = useRegionQuery(linode.region);
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

  const doesRegionSupportMetadata = region?.capabilities.includes('Metadata');
  const doesImageSupportCloudInit = image?.capabilities.includes('cloud-init');

  const disabled =
    isReadOnly || !doesRegionSupportMetadata || !doesImageSupportCloudInit;

  return (
    <Accordion
      defaultExpanded={linode.has_user_data}
      detailProps={{ sx: { p: 0 } }}
      heading="Add User Data"
      summaryProps={{ sx: { p: 0 } }}
    >
      {linode.has_user_data && (
        <Notice spacingBottom={8} spacingTop={0} variant="info">
          Adding new user data is recommended as part of the rebuild process.
        </Notice>
      )}
      <Typography>
        User data is a feature of the Metadata service that enables you to
        perform system configuration tasks (such as adding users and installing
        software) by providing custom instructions or scripts to cloud-init. Any
        user data should be added at this step and cannot be modified after the
        Linode has been created.{' '}
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
      {image && !doesImageSupportCloudInit && (
        <Notice spacingBottom={8} spacingTop={12} variant="warning">
          The selected Images does not support cloud-init.
        </Notice>
      )}
      {!image && (
        <Notice spacingBottom={8} spacingTop={12} variant="warning">
          Select an Image compatible with cloud-init to configure user data.
        </Notice>
      )}
      {region && !doesRegionSupportMetadata && (
        <Notice spacingBottom={8} spacingTop={12} variant="warning">
          This Linode's region does not support metadata.
        </Notice>
      )}
      <Controller
        control={control}
        name="metadata.user_data"
        render={({ field, fieldState }) => (
          <TextField
            disabled={reuseUserData || disabled}
            errorText={fieldState.error?.message}
            expand
            label="User Data"
            labelTooltipText="Compatible formats include cloud-config data and executable scripts."
            multiline
            onBlur={(e) => {
              field.onBlur();
              checkFormat({
                hasInputValueChanged: false,
                userData: e.target.value,
              });
            }}
            onChange={(e) => {
              const value = e.target.value;
              field.onChange(value === '' ? null : value);
              checkFormat({
                hasInputValueChanged: true,
                userData: e.target.value,
              });
            }}
            rows={1}
            value={field.value ?? ''}
          />
        )}
      />
      <Controller
        control={control}
        name="reuseUserData"
        render={({ field }) => (
          <Checkbox
            disabled={disabled || !linode.has_user_data}
            onChange={field.onChange}
            sx={{ pl: 1.5 }}
            text={`Reuse user data previously provided for ${linode.label}`}
            toolTipText={
              !linode.has_user_data
                ? 'This Linode does not have existing user data.'
                : undefined
            }
          />
        )}
      />
    </Accordion>
  );
};
