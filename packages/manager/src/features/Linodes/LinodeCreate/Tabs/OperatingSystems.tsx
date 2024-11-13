import { Notice, Paper, Stack } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
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
  const theme = useTheme();

  const queryClient = useQueryClient();
  const [imageDeprecatedText, setImageDeprecatedText] = React.useState<
    null | string
  >(null);

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

    let deprecatedNoticeText = null;
    if (image && isImageDeprecated(image)) {
      deprecatedNoticeText = `The selected ${
        image.label
      } will reach its end-of-life on ${formatDate(image.eol ?? '', {
        format: 'MM/dd/yyyy',
      })}`;
    }
    setImageDeprecatedText(deprecatedNoticeText);

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
        {imageDeprecatedText && (
          <Notice
            dataTestId="os-distro-deprecated-image-notice"
            spacingBottom={0}
            spacingTop={16}
            variant="warning"
          >
            <Typography fontFamily={theme.font.bold}>
              {imageDeprecatedText}. After this date, this OS distribution will
              no longer receive security updates or technical support. We
              recommend selecting a newer supported version to ensure continued
              security and stability for your linodes.
            </Typography>
          </Notice>
        )}
      </Paper>
    </Stack>
  );
};
