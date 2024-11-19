import { Notice, Paper, Stack } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import React from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { isImageDeprecated } from 'src/components/ImageSelect/utilities';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useRegionQuery } from 'src/queries/regions/regions';
import { formatDate } from 'src/utilities/formatDate';

import { Region } from '../Region';
import { getGeneratedLinodeLabel } from '../utilities';

import type { LinodeCreateFormValues } from '../utilities';
import type { Image } from '@linode/api-v4';

export const OperatingSystems = () => {
  const {
    formState: {
      dirtyFields: { label: isLabelFieldDirty },
    },
    getValues,
    setValue,
  } = useFormContext<LinodeCreateFormValues>();

  const queryClient = useQueryClient();
  const [deprecatedImage, setDeprecatedImage] = React.useState<Image | null>(
    null
  );

  const showImageDeprecatedWarning =
    deprecatedImage !== null && isImageDeprecated(deprecatedImage);

  const { field, fieldState } = useController<LinodeCreateFormValues>({
    name: 'image',
  });

  const regionId = useWatch<LinodeCreateFormValues, 'region'>({
    name: 'region',
  });

  const { data: region } = useRegionQuery(regionId ?? -1);

  const isCreateLinodeRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const onChange = async (image: Image | null) => {
    field.onChange(image?.id ?? null);
    setDeprecatedImage(image);

    if (!isLabelFieldDirty) {
      const label = await getGeneratedLinodeLabel({
        queryClient,
        tab: 'OS',
        values: getValues(),
      });
      setValue('label', label);
    }
  };

  return (
    <Stack spacing={3}>
      <Region />
      <Paper>
        <Typography variant="h2">Choose an OS</Typography>
        <ImageSelect
          disabled={isCreateLinodeRestricted}
          errorText={fieldState.error?.message}
          label="Linux Distribution"
          onBlur={field.onBlur}
          onChange={onChange}
          placeholder="Choose a Linux distribution"
          siteType={region?.site_type}
          value={field.value}
          variant="public"
        />
        {showImageDeprecatedWarning && (
          <Notice
            dataTestId="os-distro-deprecated-image-notice"
            spacingBottom={0}
            spacingTop={16}
            variant="warning"
          >
            {deprecatedImage.eol &&
            DateTime.fromISO(deprecatedImage.eol) > DateTime.now() ? (
              <Typography fontFamily={(theme) => theme.font.bold}>
                {deprecatedImage.label} will reach its end-of-life on{' '}
                {formatDate(deprecatedImage.eol ?? '', {
                  format: 'MM/dd/yyyy',
                })}
                . After this date, this OS distribution will no longer receive
                security updates or technical support. We recommend selecting a
                newer supported version to ensure continued security and
                stability for your linodes.
              </Typography>
            ) : (
              <Typography fontFamily={(theme) => theme.font.bold}>
                {deprecatedImage.label} reached its end-of-life on{' '}
                {formatDate(deprecatedImage.eol ?? '', {
                  format: 'MM/dd/yyyy',
                })}
                . This OS distribution will no longer receive security updates
                or technical support. We recommend selecting a newer supported
                version to ensure continued security and stability for your
                linodes.
              </Typography>
            )}
          </Notice>
        )}
      </Paper>
    </Stack>
  );
};
