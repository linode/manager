import { yupResolver } from '@hookform/resolvers/yup';
import {
  useAccountAgreements,
  useAccountSettings,
  useMutateAccountAgreements,
  useProfile,
  useRegionsQuery,
} from '@linode/queries';
import { ActionsPanel, Drawer, Notice, TextField } from '@linode/ui';
import { CreateBucketSchema } from '@linode/validation';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { EUAgreementCheckbox } from 'src/features/Account/Agreements/EUAgreementCheckbox';
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
import ClusterSelect from './ClusterSelect';
import { OveragePricing } from './OveragePricing';

import type { CreateObjectStorageBucketPayload } from '@linode/api-v4';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBucketDrawer = (props: Props) => {
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

  const { isPending, mutateAsync: createBucket } = useCreateBucketMutation();
  const { data: agreements } = useAccountAgreements();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const { data: accountSettings } = useAccountSettings();
  const [isEnableObjDialogOpen, setIsEnableObjDialogOpen] =
    React.useState(false);
  const [hasSignedAgreement, setHasSignedAgreement] =
    React.useState<boolean>(false);

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
      cluster: '',
      cors_enabled: true,
      label: '',
    },
    mode: 'onBlur',
    resolver: yupResolver(CreateBucketSchema),
  });

  const watchCluster = watch('cluster');

  const onSubmit = async (data: CreateObjectStorageBucketPayload) => {
    try {
      await createBucket(data);

      if (data.cluster) {
        sendCreateBucketEvent(data.cluster);
      }

      if (hasSignedAgreement) {
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

  const handleBucketFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (accountSettings?.object_storage !== 'active') {
      setIsEnableObjDialogOpen(true);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const clusterRegion = watchCluster
    ? regions?.find((region) => watchCluster.includes(region.id))
    : undefined;

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId: clusterRegion?.id ?? '',
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer onClose={handleClose} open={isOpen} title="Create Bucket">
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
          control={control}
          name="label"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              data-qa-cluster-label
              data-testid="label"
              disabled={isRestrictedUser}
              errorText={fieldState.error?.message}
              label="Bucket Name"
              required
            />
          )}
          rules={{ required: 'Bucket name is required' }}
        />
        <Controller
          control={control}
          name="cluster"
          render={({ field, fieldState }) => (
            <ClusterSelect
              {...field}
              data-qa-cluster-select
              disabled={isRestrictedUser}
              error={fieldState.error?.message}
              onChange={(value) => field.onChange(value)}
              required
              selectedCluster={field.value ?? undefined}
            />
          )}
          rules={{ required: 'Cluster is required' }}
        />
        {clusterRegion?.id && <OveragePricing regionId={clusterRegion.id} />}
        {showGDPRCheckbox && (
          <StyledEUAgreementCheckbox
            checked={hasSignedAgreement}
            onChange={(e) => setHasSignedAgreement(e.target.checked)}
          />
        )}
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'create-bucket-button',
            disabled:
              (showGDPRCheckbox && !hasSignedAgreement) ||
              isErrorTypes ||
              isRestrictedUser,
            label: 'Create Bucket',
            loading: isPending || Boolean(clusterRegion?.id && isLoadingTypes),
            tooltipText:
              !isLoadingTypes && isInvalidPrice
                ? PRICES_RELOAD_ERROR_NOTICE_TEXT
                : '',
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: handleClose }}
        />
        <EnableObjectStorageModal
          handleSubmit={handleSubmit(onSubmit)}
          onClose={() => setIsEnableObjDialogOpen(false)}
          open={isEnableObjDialogOpen}
          regionId={clusterRegion?.id}
        />
      </form>
    </Drawer>
  );
};

const StyledEUAgreementCheckbox = styled(EUAgreementCheckbox, {
  label: 'StyledEUAgreementCheckbox',
})(({ theme }) => ({
  marginButton: theme.spacing(3),
  marginTop: theme.spacing(3),
}));
