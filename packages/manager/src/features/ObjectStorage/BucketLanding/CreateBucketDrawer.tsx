import { yupResolver } from '@hookform/resolvers/yup';
import { CreateBucketSchema } from '@linode/validation';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { EUAgreementCheckbox } from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
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
  useObjectStorageClusters,
  useObjectStorageTypesQuery,
} from 'src/queries/objectStorage';
import { useProfile } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';
import { sendCreateBucketEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getErrorMap } from 'src/utilities/errorUtils';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';

import { EnableObjectStorageModal } from '../EnableObjectStorageModal';
import ClusterSelect from './ClusterSelect';
import { OveragePricing } from './OveragePricing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBucketDrawer = (props: Props) => {
  const { data: profile } = useProfile();
  const { isOpen, onClose } = props;
  const isRestrictedUser = profile?.restricted;

  const { account } = useAccountManagement();
  const flags = useFlags();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  const { data: regions } = useRegionsQuery();

  const { data: clusters } = useObjectStorageClusters(
    !isObjMultiClusterEnabled
  );

  const regionsSupportingObjectStorage = regions?.filter((region) =>
    region.capabilities.includes('Object Storage')
  );

  /*
   @TODO OBJ Multicluster:'region' will become required, and the
   'cluster' field will be deprecated once the feature is fully rolled out in production.
   As part of the process of cleaning up after the 'objMultiCluster' feature flag, we will
   remove 'cluster' and retain 'regions'.
  */
  const { data: buckets } = useObjectStorageBuckets({
    clusters: isObjMultiClusterEnabled ? undefined : clusters,
    isObjMultiClusterEnabled,
    regions: isObjMultiClusterEnabled
      ? regionsSupportingObjectStorage
      : undefined,
  });

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

  const {
    error,
    isLoading,
    mutateAsync: createBucket,
  } = useCreateBucketMutation();
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
    watch,
  } = useForm({
    context: { buckets },
    defaultValues: {
      cluster: '',
      cors_enabled: true,
      label: '',
    },
    resolver: yupResolver(CreateBucketSchema),
  });

  const watchCluster = watch('cluster');

  const onSubmit = async (values: any) => {
    if (accountSettings?.object_storage === 'active') {
      await createBucket(values);
      sendCreateBucketEvent(values.cluster);
      if (hasSignedAgreement) {
        updateAccountAgreements({
          eu_model: true,
        }).catch(reportAgreementSigningError);
      }
      onClose();
    } else {
      setIsEnableObjDialogOpen(true);
    }
  };

  const clusterRegion = regions?.filter((region) =>
    watchCluster.includes(region.id)
  )[0];

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId: clusterRegion?.id ?? '',
  });

  const errorMap = getErrorMap(['label', 'cluster'], error);

  return (
    <Drawer
      onClose={onClose}
      onExited={reset}
      open={isOpen}
      title="Create Bucket"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {isRestrictedUser && (
          <Notice
            data-qa-permissions-notice
            text="You don't have permissions to create a Bucket. Please contact an account administrator for details."
            variant="error"
          />
        )}
        {Boolean(errorMap.none) && (
          <Notice text={errorMap.none} variant="error" />
        )}
        <Controller
          render={({ field }) => (
            <TextField
              {...field}
              data-qa-cluster-label
              data-testid="label"
              disabled={isRestrictedUser}
              errorText={errors.label?.message || errorMap.label}
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
            <ClusterSelect
              {...field}
              data-qa-cluster-select
              disabled={isRestrictedUser}
              error={errors.cluster?.message || errorMap.cluster}
              onChange={(value) => field.onChange(value)}
              required
              selectedCluster={field.value}
            />
          )}
          control={control}
          name="cluster"
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
              !watchCluster ||
              (showGDPRCheckbox && !hasSignedAgreement) ||
              isErrorTypes,
            label: 'Create Bucket',
            loading: isLoading || Boolean(clusterRegion?.id && isLoadingTypes),
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
