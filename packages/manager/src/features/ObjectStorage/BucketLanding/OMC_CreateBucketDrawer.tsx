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

import type {
  CreateObjectStorageBucketPayload,
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
  /**
   * The unique identifier for the endpoint type. Same as the `label`.
   */
  value: string;
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
    },
    mode: 'onChange',
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

      onClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const handleBucketFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const formValues = getValues();

    // Adding custom validation in the handleBucketFormSubmit function
    // to catch missing endpoint_type values before form submission
    // since this is optional in the schema.
    if (Boolean(endpoints) && !formValues.endpoint_type) {
      setError('endpoint_type', {
        message: 'Endpoint Type is required',
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

  const filteredEndpointOptions:
    | EndpointOption[]
    | undefined = filteredEndpoints?.map(
    ({ endpoint_type, s3_endpoint }, index) => {
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
        value: `${typeLabel}-${endpoint_type}-${index}`,
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
    return undefined;
  }, [filteredEndpointOptions]);

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
    regions,
    selectedRegionId: selectedRegion?.id ?? '',
  });

  const isGen2EndpointType =
    selectedEndpointOption &&
    selectedEndpointOption.endpoint_type !== 'E0' &&
    selectedEndpointOption.endpoint_type !== 'E1';

  const handleEndpointChange = (
    _: React.SyntheticEvent<Element, Event>,
    endpointOption: EndpointOption | null
  ) => {
    if (endpointOption) {
      // CORS is not supported for E2 and E3 endpoint types
      if (
        endpointOption.endpoint_type === 'E2' ||
        endpointOption.endpoint_type === 'E3'
      ) {
        setValue('cors_enabled', false);
      }

      setValue('endpoint_type', endpointOption.endpoint_type, {
        shouldValidate: true,
      });

      if (endpointOption.s3_endpoint) {
        setValue('s3_endpoint', endpointOption.s3_endpoint);
      } else {
        setValue('s3_endpoint', undefined);
      }
    } else {
      setValue('endpoint_type', undefined, { shouldValidate: true });
      setValue('s3_endpoint', undefined);
    }
  };

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
        {Boolean(endpoints) && (
          <>
            <Controller
              render={({ field }) => (
                <Autocomplete
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) {
                      return option === value;
                    }
                    return option.value === value.value;
                  }}
                  onChange={(_, endpointOption) =>
                    handleEndpointChange(_, endpointOption)
                  }
                  textFieldProps={{
                    helperText: (
                      <Typography component="span">
                        Endpoint types impact the performance, capacity, and
                        rate limits for your bucket. Understand{' '}
                        <Link to="#">endpoint types</Link>.
                      </Typography>
                    ),
                    helperTextPosition: 'top',
                  }}
                  disableClearable={Boolean(autoSelectEndpointType)}
                  errorText={errors.endpoint_type?.message}
                  label="Object Storage Endpoint Type"
                  loading={isEndpointLoading}
                  onBlur={field.onBlur}
                  options={filteredEndpointOptions ?? []}
                  placeholder="Object Storage Endpoint Type"
                  value={selectedEndpointOption}
                />
              )}
              control={control}
              name="endpoint_type"
            />
            {selectedEndpointOption && (
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
                endpointType={selectedEndpointOption.endpoint_type}
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
              (showGDPRCheckbox && !state.hasSignedAgreement) || isErrorTypes,
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
