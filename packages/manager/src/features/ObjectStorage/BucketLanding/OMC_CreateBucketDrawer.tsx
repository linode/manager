import { yupResolver } from '@hookform/resolvers/yup';
import { CreateBucketSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
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

export const OMC_CreateBucketDrawer = (props: Props) => {
  const { data: profile } = useProfile();
  const { isOpen, onClose } = props;
  const isRestrictedUser = profile?.restricted;

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

  const region = watchRegion
    ? regions?.find((region) => watchRegion.includes(region.id))
    : undefined;

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId: region?.id ?? '',
  });

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
        {region?.id && <OveragePricing regionId={region.id} />}
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
            loading: isLoading || Boolean(region?.id && isLoadingTypes),
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
          regionId={region?.id}
        />
      </form>
    </Drawer>
  );
};
