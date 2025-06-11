import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import {
  Autocomplete,
  Box,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@linode/ui';
import { createFilterOptions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { HideShowText } from 'src/components/PasswordInput/HideShowText';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useStyles } from 'src/features/DataStream/DataStream.styles';
import { PathSample } from 'src/features/DataStream/Shared/PathSample';
import { useFlags } from 'src/hooks/useFlags';

import { type CreateStreamForm, destinationType } from './types';

type DestinationName = {
  id?: number;
  inputValue?: string;
  label: string;
};

export const StreamCreateDelivery = () => {
  const { gecko2 } = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(gecko2?.enabled, gecko2?.la);
  const { data: regions } = useRegionsQuery();
  const { classes } = useStyles();
  const theme = useTheme();
  const { control } = useFormContext<CreateStreamForm>();

  const [showDestinationForm, setShowDestinationForm] =
    React.useState<boolean>(false);

  const destinationTypeOptions = [
    {
      value: destinationType.CustomHttps,
      label: 'Custom HTTPS',
    },
    {
      value: destinationType.LinodeObjectStorage,
      label: 'Linode Object Storage',
    },
  ];

  const destinationNameOptions: DestinationName[] = [
    {
      id: 1,
      label: 'Destination 1',
    },
    {
      id: 2,
      label: 'Destination 2',
    },
  ];

  const destinationNameFilterOptions = createFilterOptions<DestinationName>();

  return (
    <Paper>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h2">Delivery</Typography>
        <DocsLink
          // TODO: Change the link when proper documentation is ready
          href="https://techdocs.akamai.com/cloud-computing/docs"
          label="Docs"
        />
      </Box>
      <Typography sx={{ mt: theme.spacingFunction(12) }}>
        Define a destination where you want this stream to send logs.
      </Typography>
      <Controller
        control={control}
        name="destination_type"
        render={({ field }) => (
          <Autocomplete
            className={classes.input}
            disableClearable
            disabled={true}
            label="Destination Type"
            onChange={(_, { value }) => {
              field.onChange(value);
            }}
            options={destinationTypeOptions}
            value={destinationTypeOptions.find(
              ({ value }) => value === field.value
            )}
          />
        )}
        rules={{ required: true }}
      />
      <Controller
        control={control}
        name="destination_label"
        render={({ field }) => (
          <Autocomplete
            className={classes.input}
            filterOptions={(options, params) => {
              const filtered = destinationNameFilterOptions(options, params);
              const { inputValue } = params;
              const isExisting = options.some(
                ({ label }) => inputValue === label
              );

              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  label: `Create "${inputValue}"`,
                });
              }

              return filtered;
            }}
            getOptionLabel={(option) => option.inputValue ?? option.label}
            label="Destination Name"
            onChange={(_, newValue) => {
              if (newValue?.inputValue) {
                field.onChange(newValue.inputValue);
                return setShowDestinationForm(true);
              } else if (newValue?.label) {
                field.onChange(newValue.label);
              } else {
                field.onChange(newValue);
              }
              setShowDestinationForm(false);
            }}
            options={destinationNameOptions}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <li key={key} {...optionProps}>
                  {option.label}
                </li>
              );
            }}
            value={
              destinationNameOptions.find(
                ({ label }) => label === field.value
              ) ?? (field.value ? { label: field.value } : null)
            }
          />
        )}
        rules={{ required: true }}
      />
      {showDestinationForm && (
        <>
          <Controller
            control={control}
            name="host"
            render={({ field }) => (
              <TextField
                aria-required
                className={classes.input}
                label="Host"
                onChange={(value) => {
                  field.onChange(value);
                }}
                placeholder="Host..."
                value={field.value}
              />
            )}
            rules={{ required: true }}
          />
          <Controller
            control={control}
            name="bucket_name"
            render={({ field }) => (
              <TextField
                aria-required
                className={classes.input}
                label="Bucket"
                onChange={(value) => {
                  field.onChange(value);
                }}
                placeholder="Bucket..."
                value={field.value}
              />
            )}
            rules={{ required: true }}
          />
          <Controller
            control={control}
            name="region"
            render={({ field }) => (
              <RegionSelect
                currentCapability="Object Storage"
                disableClearable
                isGeckoLAEnabled={isGeckoLAEnabled}
                label="Region"
                onChange={(_, region) => field.onChange(region.id)}
                regionFilter="core"
                regions={regions ?? []}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="access_key_id"
            render={({ field }) => (
              <HideShowText
                aria-required
                label="Access Key ID"
                onChange={(value) => field.onChange(value)}
                placeholder="Access Key ID..."
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="access_key_secret"
            render={({ field }) => (
              <HideShowText
                aria-required
                label="Secret Access Key"
                onChange={(value) => field.onChange(value)}
                placeholder="Secret Access Key..."
                value={field.value}
              />
            )}
          />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h2">Path</Typography>
          <Box alignItems="end" display="flex" flexWrap="wrap" gap="16px">
            <Controller
              control={control}
              name="path"
              render={({ field }) => (
                <TextField
                  aria-required
                  className={classes.input}
                  label="Log Path Prefix"
                  onChange={(value) => field.onChange(value)}
                  placeholder="Log Path Prefix..."
                  value={field.value}
                />
              )}
            />
            <PathSample
              className={classes.input}
              value="text-cloud/logs/audit/02/26/2026" // TODO: Generate sample path value in DPS-33654
            />
          </Box>
        </>
      )}
    </Paper>
  );
};
