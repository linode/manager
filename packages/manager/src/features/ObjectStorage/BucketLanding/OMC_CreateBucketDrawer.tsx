import { yupResolver } from '@hookform/resolvers/yup';
import { CreateBucketSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Drawer } from 'src/components/Drawer';
import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { BucketRateLimitTable } from 'src/features/ObjectStorage/BucketLanding/BucketRateLimitTable';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/account/agreements';
import { useAccountSettings } from 'src/queries/account/settings';
import { useNetworkTransferPricesQuery } from 'src/queries/networkTransfer';
import {
  useCreateBucketMutation,
  useObjectStorageBuckets,
  useObjectStorageEndpoints,
  useObjectStorageTypesQuery,
} from 'src/queries/object-storage/queries';
import { useProfile } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { sendCreateBucketEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';

import { EnableObjectStorageModal } from '../EnableObjectStorageModal';
import { BucketRegions } from './BucketRegions';
import { StyledEUAgreementCheckbox } from './OMC_CreateBucketDrawer.styles';
import { OveragePricing } from './OveragePricing';

import type { CreateObjectStorageBucketPayload } from '@linode/api-v4';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface EndpointCount {
  [key: string]: number;
}

export const OMC_CreateBucketDrawer = (props: Props) => {
  const { data: profile } = useProfile();
  const { isOpen, onClose } = props;
  const isRestrictedUser = profile?.restricted;
  const {
    data: endpoints,
    isFetching: isEndpointLoading,
  } = useObjectStorageEndpoints();

  const { data: regions } = useRegionsQuery();

  const { data: bucketsData } = useObjectStorageBuckets();

  const {
    data: objTypes,
    isError: isErrorObjTypes,
    isInitialLoading: isLoadingObjTypes,
  } = useObjectStorageTypesQuery(isOpen);
  const {
    data: transferTypes,
    isError: isErrorTransferTypes,
    isInitialLoading: isLoadingTransferTypes,
  } = useNetworkTransferPricesQuery(isOpen);

  const isErrorTypes = isErrorTransferTypes || isErrorObjTypes;
  const isLoadingTypes = isLoadingTransferTypes || isLoadingObjTypes;
  const isInvalidPrice =
    !objTypes || !transferTypes || isErrorTypes || isErrorTransferTypes;

  const { isLoading, mutateAsync: createBucket } = useCreateBucketMutation();
  const { data: agreements } = useAccountAgreements();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const { data: accountSettings } = useAccountSettings();
  const [isEnableObjDialogOpen, setIsEnableObjDialogOpen] = React.useState(
    false
  );
  const [hasSignedAgreement, setHasSignedAgreement] = React.useState<boolean>(
    false
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<CreateObjectStorageBucketPayload>({
    context: { buckets: bucketsData?.buckets ?? [] },
    defaultValues: {
      cors_enabled: true,
      label: '',
      region: '',
    },
    mode: 'onBlur',
    resolver: yupResolver(CreateBucketSchema),
  });

  const watchRegion = watch('region');
  const watchEndpointType = watch('endpoint_type');

  const onSubmit = async (data: CreateObjectStorageBucketPayload) => {
    try {
      await createBucket(data);

      if (data.region) {
        sendCreateBucketEvent(data.region);
      }

      if (hasSignedAgreement) {
        try {
          await updateAccountAgreements({ eu_model: true });
        } catch (error) {
          reportAgreementSigningError(error);
        }
      }

      onClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const handleBucketFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (accountSettings?.object_storage !== 'active') {
      setIsEnableObjDialogOpen(true);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const selectedRegion = watchRegion
    ? regions?.find((region) => watchRegion.includes(region.id))
    : undefined;

  /**
   * In rare cases, the dropdown must display a specific endpoint hostname (s3_endpoint) along with
   * the endpoint type to distinguish between two assigned endpoints of the same type.
   * This is necessary for multiple gen1 (E1) assignments in the same region.
   */
  const filteredEndpoints = endpoints?.filter(
    (endpoint) => selectedRegion?.id === endpoint.region
  );

  // Create a histogram (frequency distribution) of endpoint types for the selected region
  const endpointCounts = filteredEndpoints?.reduce(
    (acc: EndpointCount, { endpoint_type }) => {
      acc[endpoint_type] = (acc[endpoint_type] || 0) + 1;
      return acc;
    },
    {}
  );

  const filteredEndpointOptions = filteredEndpoints?.map(
    ({ endpoint_type, s3_endpoint }) => {
      const isLegacy = endpoint_type === 'E0';
      const typeLabel = isLegacy ? 'Legacy' : 'Standard';
      const shouldShowHostname =
        endpointCounts && endpointCounts[endpoint_type] > 1;
      const label =
        shouldShowHostname && s3_endpoint !== null
          ? `${typeLabel} (${endpoint_type}) ${s3_endpoint}`
          : `${typeLabel} (${endpoint_type})`;

      return {
        endpoint_type,
        label,
        s3_endpoint: s3_endpoint ?? undefined,
        value: endpoint_type,
      };
    }
  );

  // Automatically select the endpoint type if only one is available in the chosen region.
  const autoSelectEndpointType = React.useMemo(() => {
    if (filteredEndpointOptions?.length === 1) {
      const option = filteredEndpointOptions[0];
      return {
        ...option,
        s3_endpoint: option.s3_endpoint ?? undefined,
      };
    }
    return null;
  }, [filteredEndpointOptions]);

  const selectedEndpointType =
    filteredEndpointOptions?.find(
      (endpoint) => endpoint.value === watchEndpointType
    ) ?? null;

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId: selectedRegion?.id ?? '',
  });

  const isGen2EndpointType =
    selectedEndpointType &&
    selectedEndpointType.value !== 'E0' &&
    selectedEndpointType.value !== 'E1';

  React.useEffect(() => {
    const { endpoint_type, s3_endpoint, value } =
      autoSelectEndpointType || selectedEndpointType || {};

    if (s3_endpoint) {
      setValue('s3_endpoint', s3_endpoint);
    }

    if (endpoint_type) {
      setValue('endpoint_type', endpoint_type);
    }

    if (value && ['E2', 'E3'].includes(value)) {
      setValue('cors_enabled', false);
    }
  }, [autoSelectEndpointType, selectedEndpointType, setValue]);

  return (
    <Drawer
      onClose={onClose}
      onExited={reset}
      open={isOpen}
      title="Create Bucket"
    >
      <form onSubmit={handleBucketFormSubmit}>
        {isRestrictedUser && (
          <Notice
            data-qa-permissions-notice
            text="You don't have permissions to create a Bucket. Please contact an account administrator for details."
            variant="error"
          />
        )}
        {errors.root?.message && (
          <Notice text={errors.root?.message} variant="error" />
        )}
        <Controller
          render={({ field }) => (
            <TextField
              {...field}
              data-qa-cluster-label
              data-testid="label"
              disabled={isRestrictedUser}
              errorText={errors.label?.message}
              label="Label"
              required
            />
          )}
          control={control}
          name="label"
          rules={{ required: 'Label is required' }}
        />
        <Controller
          render={({ field }) => (
            <BucketRegions
              disabled={isRestrictedUser}
              error={errors.region?.message}
              onBlur={field.onBlur}
              onChange={(value) => field.onChange(value)}
              required
              selectedRegion={field.value}
            />
          )}
          control={control}
          name="region"
          rules={{ required: 'Region is required' }}
        />
        {selectedRegion?.id && <OveragePricing regionId={selectedRegion.id} />}
        {Boolean(endpoints) && (
          <>
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  onChange={(e, endpoint) =>
                    field.onChange(endpoint?.value ?? '')
                  }
                  textFieldProps={{
                    helperText: (
                      <Typography marginBottom={2} marginTop={1}>
                        Endpoint types impact the performance, capacity, and
                        rate limits for your bucket. Understand{' '}
                        <Link to="#">endpoint types</Link>.
                      </Typography>
                    ),
                    helperTextPosition: 'top',
                  }}
                  disableClearable={Boolean(autoSelectEndpointType)}
                  errorText={fieldState.error?.message}
                  label="Object Storage Endpoint Type"
                  loading={isEndpointLoading}
                  onBlur={field.onBlur}
                  options={filteredEndpointOptions ?? []}
                  placeholder="Object Storage Endpoint Type"
                  value={autoSelectEndpointType || selectedEndpointType}
                />
              )}
              control={control}
              name="endpoint_type"
              rules={{ required: 'Endpoint Type is required' }}
            />
            {selectedEndpointType && (
              <>
                <FormLabel>
                  <Typography marginBottom={1} marginTop={2} variant="inherit">
                    Bucket Rate Limits
                  </Typography>
                </FormLabel>
                <Typography marginBottom={isGen2EndpointType ? 2 : 3}>
                  {isGen2EndpointType
                    ? 'Specifies the maximum Requests Per Second (RPS) for a bucket. To increase it to High, open a support ticket. '
                    : 'This endpoint type supports up to 750 Requests Per Second (RPS). '}
                  Understand <Link to="#">bucket rate limits</Link>.
                </Typography>
              </>
            )}
            {isGen2EndpointType && (
              <BucketRateLimitTable
                selectedEndpointType={selectedEndpointType}
              />
            )}
          </>
        )}
        {showGDPRCheckbox ? (
          <StyledEUAgreementCheckbox
            checked={hasSignedAgreement}
            onChange={(e) => setHasSignedAgreement(e.target.checked)}
          />
        ) : null}
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'create-bucket-button',
            disabled: (showGDPRCheckbox && !hasSignedAgreement) || isErrorTypes,
            label: 'Create Bucket',
            loading: isLoading || Boolean(selectedRegion?.id && isLoadingTypes),
            tooltipText:
              !isLoadingTypes && isInvalidPrice
                ? PRICES_RELOAD_ERROR_NOTICE_TEXT
                : '',
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
        <EnableObjectStorageModal
          handleSubmit={handleSubmit(onSubmit)}
          onClose={() => setIsEnableObjDialogOpen(false)}
          open={isEnableObjDialogOpen}
          regionId={selectedRegion?.id}
        />
      </form>
    </Drawer>
  );
};
