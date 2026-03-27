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
import {
  getDCSpecificPriceByType,
  renderMonthlyPriceToCorrectDecimalPlace,
} from 'src/utilities/pricing/dynamicPricing';

import { RESERVE_IP_DESCRIPTION, RESERVED_IPS_DOCS_LINK } from './constants';

import type { IPAddress } from '@linode/api-v4';
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
  open: boolean;
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
  const { ipAddress, mode, onClose, open } = props;

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
  const { enqueueSnackbar } = useSnackbar();

  const isRegionDisabled = mode === 'edit' || mode === 'reserve';

  const {
    control,
    formState: { errors, isDirty, isSubmitting, isValid },
    handleSubmit,
    reset,
    setError,
  } = useForm<ReserveIPFormValues>({
    mode: 'onChange',
    values: {
      region: ipAddress?.region ?? '',
      tags: (ipAddress?.tags ?? []).map((t) => ({ label: t, value: t })),
    },
  });

  const isSubmitDisabled =
    mode === 'create' ? !isValid : mode === 'edit' ? !isDirty : false;

  const selectedRegion = useWatch({ control, name: 'region' });

  const reservedIPPrice = getDCSpecificPriceByType({
    regionId: selectedRegion,
    type: reservedIPTypes?.[0],
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  const onSubmit = async (values: ReserveIPFormValues) => {
    try {
      const tags = values.tags.map((tag) => tag.value);

      if (mode === 'create') {
        const created = await reserveIP({ region: values.region, tags });
        enqueueSnackbar(`${created.address} has been reserved`, {
          variant: 'success',
        });
      } else {
        await updateReservedIP({ address: ipAddress?.address ?? '', tags });
        const verb = mode === 'reserve' ? 'reserved' : 'updated';
        enqueueSnackbar(`${ipAddress?.address} has been ${verb}`, {
          variant: 'success',
        });
      }

      handleClose();
    } catch (apiErrors) {
      for (const error of apiErrors as { field?: string; reason: string }[]) {
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
      onClose={handleClose}
      onTransitionExited={() => reset()}
      open={open}
      title={reserveIPDrawerConfig[mode].title}
    >
      {isLoading ? (
        <CircleProgress />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <Typography variant="body1">
              {RESERVE_IP_DESCRIPTION}
              <br />
              <Link to={RESERVED_IPS_DOCS_LINK}>Learn more</Link>.
            </Typography>

            {errors.root?.message && (
              <Notice spacingTop={8} variant="error">
                {errors.root.message}
              </Notice>
            )}

            {(mode === 'reserve' || mode === 'edit') && ipAddress?.address && (
              <Box>
                <Typography>IP Address</Typography>
                <Typography
                  sx={(theme) => ({
                    color: theme.palette.text.primary,
                    marginTop: `${theme.spacingFunction(8)} !important`,
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
                {`$${renderMonthlyPriceToCorrectDecimalPlace(
                  reservedIPPrice ? Number(reservedIPPrice) : undefined
                )} / mo.`}
              </Typography>
            )}
          </Stack>

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'reserve-button',
              disabled: isSubmitDisabled,
              label: reserveIPDrawerConfig[mode].submitLabel,
              loading: isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
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
