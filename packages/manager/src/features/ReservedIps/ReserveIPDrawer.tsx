/* Reserve IP Drawer
*
* Usage:
<ReserveIPDrawer mode="create" open={open} onClose={handleClose} />

// Edit reserved IP (allows editing tags, but not region or IP address)
<ReserveIPDrawer mode="edit" open={open} onClose={handleClose}
  ipAddress={ipAddressObject} />

// Reserve an existing IP (shows IP as readonly)
<ReserveIPDrawer mode="reserve" open={open} onClose={handleClose}
  ipAddress={ipAddressObject} />
*/
import {
  useRegionsQuery,
  useReservedIPTypesQuery,
  useReserveIPMutation,
  useUpdateIPMutation,
  useUpdateReservedIPMutation,
} from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import {
  ActionsPanel,
  Box,
  CircleProgress,
  Drawer,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { useFlags } from 'src/hooks/useFlags';

import { RESERVE_AN_IP_DOC_LINK, RESERVE_IP_DESCRIPTION } from './constants';
import { getReservedIPHourlyPrice } from './utils';

import type { APIError, IPAddress } from '@linode/api-v4';
import type { TagOption } from 'src/components/TagsInput/TagsInput';

export type ReserveIPDrawerMode = 'create' | 'edit' | 'reserve';

export interface ReserveIPDrawerProps {
  /**
   * The IPAddress object to pre-populate the form. Provides the address (shown
   * readonly in reserve mode), region, and tags. Required when mode is 'edit' or 'reserve'.
   */
  ipAddress?: IPAddress;
  mode: ReserveIPDrawerMode;
  onClose: () => void;
  onSuccess?: (ip: IPAddress) => void;
  open: boolean;
  /**
   * Optional overrides for Pendo tracking IDs on drawer elements.
   */
  pendoIds?: {
    cancel?: string;
    close?: string;
    submit?: string;
  };
  // Optional region text to display when mode is 'create'. This is to show region
  // selected and disabled while reserving an IP during create Linode flow.
  region?: string;
}

interface ReserveIPFormValues {
  region: string;
  tags: TagOption[];
}

const reserveIPDrawerConfig: Record<
  ReserveIPDrawerMode,
  { submitLabel: string; title: string }
> = {
  create: {
    submitLabel: 'Reserve IP Address',
    title: 'Reserve an IP Address',
  },
  edit: {
    submitLabel: 'Save',
    title: 'Edit Reserved IP',
  },
  reserve: {
    submitLabel: 'Reserve IP Address',
    title: 'Reserve an IP Address',
  },
};

export const ReserveIPDrawer = (props: ReserveIPDrawerProps) => {
  const { ipAddress, mode, onClose, open, pendoIds } = props;

  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );
  const { data: regions, isLoading: isRegionsLoading } = useRegionsQuery();
  const { data: reservedIPTypes, isLoading: isReservedIPTypesLoading } =
    useReservedIPTypesQuery();

  const isLoading = isRegionsLoading || isReservedIPTypesLoading;
  const { mutateAsync: reserveIP } = useReserveIPMutation();
  const { mutateAsync: updateReservedIP } = useUpdateReservedIPMutation(
    ipAddress?.address ?? ''
  );
  const { mutateAsync: updateIP } = useUpdateIPMutation(
    ipAddress?.address ?? ''
  );
  const { enqueueSnackbar } = useSnackbar();

  const isRegionDisabled =
    mode === 'edit' || mode === 'reserve' || Boolean(props.region);

  const {
    control,
    formState: { errors, isDirty, isSubmitting, isValid },
    handleSubmit,
    reset,
    setError,
  } = useForm<ReserveIPFormValues>({
    mode: 'onChange',
    values: {
      region: props.region ?? ipAddress?.region ?? '',
      tags: (ipAddress?.tags ?? []).map((t) => ({ label: t, value: t })),
    },
  });

  const isSubmitDisabled =
    isSubmitting ||
    (mode === 'create' ? !isValid : mode === 'edit' ? !isDirty : false);

  const selectedRegion = useWatch({ control, name: 'region' });

  const reservedIPPrice = getReservedIPHourlyPrice({
    regionId: selectedRegion,
    type: reservedIPTypes?.[0],
  });

  const handleClose = () => {
    onClose();
  };

  const onSubmit = async (values: ReserveIPFormValues) => {
    try {
      const tags = values.tags.map((tag) => tag.value);

      switch (mode) {
        // Reserve any random IP address in the selected region with the provided tags
        case 'create': {
          const created = await reserveIP({ region: values.region, tags });
          enqueueSnackbar(`${created.address} has been reserved`, {
            variant: 'success',
          });
          props.onSuccess?.(created);
          break;
        }
        // Update tags for the provided Reserved IP address
        case 'edit': {
          const edited = await updateReservedIP({
            address: ipAddress?.address ?? '',
            tags,
          });
          enqueueSnackbar(`${ipAddress?.address} has been updated`, {
            variant: 'success',
          });
          props.onSuccess?.(edited);
          break;
        }
        // Reserve the provided Ephemeral IP address with the provided tags and region.
        case 'reserve': {
          const reserved = await updateIP({
            address: ipAddress?.address ?? '',
            rdns: undefined,
            reserved: true,
          });

          // Update tags separately(as updateIP API call doesn't handle tags) if tags are provided
          if (tags.length > 0) {
            await updateReservedIP({
              address: ipAddress?.address ?? '',
              tags,
            });
          }

          enqueueSnackbar(`${ipAddress?.address} has been reserved`, {
            variant: 'success',
          });
          props.onSuccess?.(reserved);
          break;
        }
        default:
          return;
      }
      handleClose();
    } catch (apiErrors) {
      for (const error of apiErrors as APIError[]) {
        if (error?.field === 'region' || error?.field === 'tags') {
          setError(error.field, { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
      }
    }
  };

  return (
    <Drawer
      closeButtonPendoId={pendoIds?.close}
      onClose={handleClose}
      onTransitionExited={() => reset()}
      open={open}
      title={reserveIPDrawerConfig[mode].title}
    >
      {isLoading ? (
        <CircleProgress />
      ) : (
        <form
          aria-label={reserveIPDrawerConfig[mode].title}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Stack spacing={2.5}>
            {mode !== 'edit' && (
              <Typography variant="body1">
                {RESERVE_IP_DESCRIPTION}
                <br />
                <Link
                  pendoId="Reserved IPs Reserve IP-Learn-more"
                  to={RESERVE_AN_IP_DOC_LINK}
                >
                  Learn more
                </Link>
                .
              </Typography>
            )}

            {errors.root?.message && (
              <Notice spacingTop={8} variant="error">
                {errors.root.message}
              </Notice>
            )}

            {(mode === 'reserve' || mode === 'edit') && ipAddress?.address && (
              <Box>
                <Typography
                  sx={(theme) => ({
                    font: theme.font.bold,
                  })}
                  variant="body2"
                >
                  IP Address
                </Typography>
                <Typography
                  component="span"
                  sx={(theme) => ({
                    color: theme.palette.text.primary,
                    display: 'block',
                    marginTop: theme.spacingFunction(8),
                  })}
                >
                  {ipAddress.address}
                </Typography>
              </Box>
            )}

            <Controller
              control={control}
              name="region"
              render={({ field, fieldState }) => (
                <RegionSelect
                  currentCapability={undefined}
                  disabled={isRegionDisabled}
                  errorText={fieldState.error?.message}
                  isGeckoLAEnabled={isGeckoLAEnabled}
                  noMarginTop
                  onChange={(_, region) => field.onChange(region?.id ?? '')}
                  pendoIdPrefix="Reserved IPs Reserve IP Region"
                  regions={regions ?? []}
                  value={field.value}
                />
              )}
              rules={
                mode === 'create' ? { required: 'Region is required.' } : {}
              }
            />

            <Controller
              control={control}
              name="tags"
              render={({ field, fieldState }) => (
                <TagsInput
                  label="Tags"
                  noMarginTop
                  onChange={field.onChange}
                  optional={mode === 'create'}
                  tagError={fieldState.error?.message}
                  value={field.value}
                />
              )}
            />
            {reservedIPPrice && mode !== 'edit' && (
              <Typography
                sx={(theme) => ({ color: theme.palette.text.secondary })}
                variant="body1"
              >
                {`$${reservedIPPrice} / hour.`}
              </Typography>
            )}
          </Stack>

          <ActionsPanel
            primaryButtonProps={{
              'data-pendo-id': pendoIds?.submit,
              'data-testid': 'reserve-button',
              disabled: isSubmitDisabled,
              label: reserveIPDrawerConfig[mode].submitLabel,
              loading: isSubmitting,
              type: 'button',
              onClick: handleSubmit(onSubmit),
            }}
            secondaryButtonProps={{
              'data-pendo-id': pendoIds?.cancel,
              'data-testid': 'cancel-button',
              label: 'Cancel',
              onClick: handleClose,
            }}
            sx={{ marginTop: '30px !important' }}
          />
        </form>
      )}
    </Drawer>
  );
};
