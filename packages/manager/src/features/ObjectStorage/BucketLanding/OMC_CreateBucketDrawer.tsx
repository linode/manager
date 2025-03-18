import { yupResolver } from '@hookform/resolvers/yup';
import {
  useAccountAgreements,
  useAccountSettings,
  useMutateAccountAgreements,
  useProfile,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  Notice,
  TextField,
  Typography,
} from '@linode/ui';
import { CreateBucketSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import { BucketRateLimitTable } from 'src/features/ObjectStorage/BucketLanding/BucketRateLimitTable';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useNetworkTransferPricesQuery } from 'src/queries/networkTransfer';
import {
  useCreateBucketMutation,
  useObjectStorageBuckets,
  useObjectStorageTypesQuery,
} from 'src/queries/object-storage/queries';
import { sendCreateBucketEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';
import { reportAgreementSigningError } from 'src/utilities/reportAgreementSigningError';

import { EnableObjectStorageModal } from '../EnableObjectStorageModal';
import { BucketRegions } from './BucketRegions';
import { StyledEUAgreementCheckbox } from './OMC_CreateBucketDrawer.styles';
import { OveragePricing } from './OveragePricing';

import type {
  CreateObjectStorageBucketPayload,
  ObjectStorageEndpoint,
  ObjectStorageEndpointTypes,
} from '@linode/api-v4';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface EndpointCount {
  [key: string]: number;
}

interface EndpointOption {
  /**
   * The type of endpoint.
   */
  endpoint_type: ObjectStorageEndpointTypes;
  /**
   * The label to display in the dropdown.
   */
  label: string;
  /**
   * The hostname of the endpoint. This is only necessary when multiple endpoints of the same type are assigned to a region.
   */
  s3_endpoint?: string;
}

export const OMC_CreateBucketDrawer = (props: Props) => {
  const { data: profile } = useProfile();
  const { isOpen, onClose } = props;
  const isRestrictedUser = profile?.restricted;

  const {
    availableStorageRegions,
    isStorageEndpointsLoading,
    storageEndpoints,
  } = useObjectStorageRegions();

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

  const { isPending, mutateAsync: createBucket } = useCreateBucketMutation();
  const { data: agreements } = useAccountAgreements();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const { data: accountSettings } = useAccountSettings();

  const [state, setState] = React.useState({
    hasSignedAgreement: false,
    isEnableObjDialogOpen: false,
  });

  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
    resetField,
    setError,
    setValue,
    watch,
  } = useForm<CreateObjectStorageBucketPayload>({
    context: { buckets: bucketsData?.buckets ?? [] },
    defaultValues: {
      cors_enabled: true,
      endpoint_type: undefined,
      label: '',
      region: '',
      s3_endpoint: undefined,
    },
    mode: 'onBlur',
    resolver: yupResolver(CreateBucketSchema),
  });

  const watchRegion = watch('region');

  const onSubmit = async (data: CreateObjectStorageBucketPayload) => {
    try {
      await createBucket(data);

      if (data.region) {
        sendCreateBucketEvent(data.region);
      }

      if (state.hasSignedAgreement) {
        try {
          await updateAccountAgreements({ eu_model: true });
        } catch (error) {
          reportAgreementSigningError(error);
        }
      }

      handleClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBucketFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const formValues = getValues();

    // Custom validation in the handleBucketFormSubmit function
    // to catch missing endpoint_type values before form submission
    // since this is optional in the schema.
    if (Boolean(storageEndpoints) && !formValues.endpoint_type) {
      setError('endpoint_type', {
        message: 'Endpoint Type is required.',
        type: 'manual',
      });
      return;
    }

    if (accountSettings?.object_storage !== 'active') {
      setState((prev) => ({ ...prev, isEnableObjDialogOpen: true }));
    } else {
      await handleSubmit(onSubmit)(e);
    }
  };

  const selectedRegion = watchRegion
    ? availableStorageRegions?.find((region) => watchRegion === region.id)
    : undefined;

  const filteredEndpoints = storageEndpoints?.filter(
    (endpoint) => selectedRegion?.id === endpoint.region
  );

  // In rare cases, the dropdown must display a specific endpoint hostname (s3_endpoint) along with
  // the endpoint type to distinguish between two assigned endpoints of the same type.
  // This is necessary for multiple gen1 (E1) assignments in the same region.
  const endpointCounts = filteredEndpoints?.reduce(
    (acc: EndpointCount, { endpoint_type }) => {
      acc[endpoint_type] = (acc[endpoint_type] || 0) + 1;
      return acc;
    },
    {}
  );

  const createEndpointOption = (
    endpoint: ObjectStorageEndpoint
  ): EndpointOption => {
    const { endpoint_type, s3_endpoint } = endpoint;
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
    };
  };

  const filteredEndpointOptions:
    | EndpointOption[]
    | undefined = filteredEndpoints?.map(createEndpointOption);

  const hasSingleEndpointType = filteredEndpointOptions?.length === 1;

  const isBucketCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_buckets',
  });

  const selectedEndpointOption = React.useMemo(() => {
    const currentEndpointType = watch('endpoint_type');
    const currentS3Endpoint = watch('s3_endpoint');
    return (
      filteredEndpointOptions?.find(
        (endpoint) =>
          endpoint.endpoint_type === currentEndpointType &&
          endpoint.s3_endpoint === currentS3Endpoint
      ) || null
    );
  }, [filteredEndpointOptions, watch]);

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions: availableStorageRegions,
    selectedRegionId: selectedRegion?.id ?? '',
  });

  const resetSpecificFormFields = () => {
    resetField('endpoint_type');
    setValue('s3_endpoint', undefined);
    setValue('cors_enabled', true);
  };

  const updateEndpointType = (endpointOption: EndpointOption | null) => {
    if (endpointOption) {
      const { endpoint_type, s3_endpoint } = endpointOption;
      const isGen2Endpoint = endpoint_type === 'E2' || endpoint_type === 'E3';

      if (isGen2Endpoint) {
        setValue('cors_enabled', false);
      }

      setValue('endpoint_type', endpoint_type, { shouldValidate: true });
      setValue('s3_endpoint', s3_endpoint);
    } else {
      resetSpecificFormFields();
    }
  };

  // Both of these are side effects that should only run when the region changes
  React.useEffect(() => {
    // Auto-select an endpoint option if there's only one
    if (filteredEndpointOptions && filteredEndpointOptions.length === 1) {
      updateEndpointType(filteredEndpointOptions[0]);
    } else {
      // When region changes, reset values
      resetSpecificFormFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchRegion]);

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={handleClose}
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
              data-qa-cluster-label
              data-testid="label"
              disabled={isRestrictedUser}
              errorText={errors.label?.message}
              label="Label"
              onBlur={field.onBlur}
              onChange={field.onChange}
              required
              value={field.value ?? ''}
            />
          )}
          control={control}
          name="label"
        />
        <Controller
          render={({ field }) => (
            <BucketRegions
              onChange={(value) => {
                field.onChange(value);
              }}
              disabled={isRestrictedUser}
              error={errors.region?.message}
              onBlur={field.onBlur}
              required
              selectedRegion={field.value}
            />
          )}
          control={control}
          name="region"
        />
        {selectedRegion?.id && <OveragePricing regionId={selectedRegion.id} />}
        {Boolean(storageEndpoints) && selectedRegion && (
          <>
            <Controller
              render={({ field }) => (
                <Autocomplete
                  onChange={(_, endpointOption) =>
                    updateEndpointType(endpointOption)
                  }
                  textFieldProps={{
                    containerProps: {
                      sx: {
                        '> .MuiFormHelperText-root': {
                          marginBottom: 1,
                        },
                      },
                    },
                    helperText: (
                      <Typography component="span">
                        Endpoint types impact the performance, capacity, and
                        rate limits for your bucket. Understand{' '}
                        <Link to="https://techdocs.akamai.com/cloud-computing/docs/object-storage">
                          endpoint types
                        </Link>
                        .
                      </Typography>
                    ),
                    helperTextPosition: 'top',
                  }}
                  disableClearable={hasSingleEndpointType}
                  errorText={errors.endpoint_type?.message}
                  label="Object Storage Endpoint Type"
                  loading={isStorageEndpointsLoading}
                  onBlur={field.onBlur}
                  options={filteredEndpointOptions ?? []}
                  placeholder="Object Storage Endpoint Type"
                  value={selectedEndpointOption}
                />
              )}
              control={control}
              name="endpoint_type"
            />
            {Boolean(storageEndpoints) && selectedEndpointOption && (
              <BucketRateLimitTable
                typographyProps={{
                  marginTop: 1,
                  variant: 'inherit',
                }}
                endpointType={selectedEndpointOption?.endpoint_type}
              />
            )}
          </>
        )}
        {showGDPRCheckbox ? (
          <StyledEUAgreementCheckbox
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                hasSignedAgreement: e.target.checked,
              }))
            }
            checked={state.hasSignedAgreement}
          />
        ) : null}
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'create-bucket-button',
            disabled:
              (showGDPRCheckbox && !state.hasSignedAgreement) ||
              isErrorTypes ||
              isBucketCreationRestricted,
            label: 'Create Bucket',
            loading: isPending || Boolean(selectedRegion?.id && isLoadingTypes),
            tooltipText:
              !isLoadingTypes && isInvalidPrice
                ? PRICES_RELOAD_ERROR_NOTICE_TEXT
                : '',
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: handleClose }}
        />
        <EnableObjectStorageModal
          onClose={() =>
            setState((prev) => ({
              ...prev,
              isEnableObjDialogOpen: false,
            }))
          }
          handleSubmit={handleSubmit(onSubmit)}
          open={state.isEnableObjDialogOpen}
          regionId={selectedRegion?.id}
        />
      </form>
    </Drawer>
  );
};
