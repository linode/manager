import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as React from 'react';

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
import {
  useCreateBucketMutation,
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { sendCreateBucketEvent } from 'src/utilities/analytics';
import { getErrorMap } from 'src/utilities/errorUtils';
import { getGDPRDetails } from 'src/utilities/formatRegion';

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

  const isObjMultiClusterEnabled = isFeatureEnabled(
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
    error,
    isLoading,
    mutateAsync: createBucket,
    reset,
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

  const formik = useFormik({
    initialValues: {
      cluster: '',
      label: '',
    },
    async onSubmit(values) {
      await createBucket(values);
      sendCreateBucketEvent(values.cluster);
      if (hasSignedAgreement) {
        updateAccountAgreements({
          eu_model: true,
        }).catch(reportAgreementSigningError);
      }
      onClose();
    },
    validate(values) {
      reset();
      const doesBucketExist = buckets?.buckets.find(
        (b) => b.label === values.label && b.cluster === values.cluster
      );
      if (doesBucketExist) {
        return {
          label:
            'A bucket with this label already exists in your selected region',
        };
      }
      return {};
    },
  });

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (accountSettings?.object_storage === 'active') {
      formik.handleSubmit(e);
    } else {
      setIsEnableObjDialogOpen(true);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      formik.resetForm();
      reset();
    }
  }, [isOpen]);

  const clusterRegion =
    regions &&
    regions.filter((region) => {
      return formik.values.cluster.includes(region.id);
    });

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId: clusterRegion?.[0]?.id ?? '',
  });

  const errorMap = getErrorMap(['label', 'cluster'], error);

  return (
    <Drawer onClose={onClose} open={isOpen} title="Create Bucket">
      <form onSubmit={onSubmit}>
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
        <TextField
          data-qa-cluster-label
          data-testid="label"
          disabled={isRestrictedUser}
          errorText={errorMap.label ?? formik.errors.label}
          label="Label"
          name="label"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          required
          value={formik.values.label}
        />
        <ClusterSelect
          data-qa-cluster-select
          disabled={isRestrictedUser}
          error={errorMap.cluster}
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue('cluster', value)}
          required
          selectedCluster={formik.values.cluster}
        />
        {clusterRegion?.[0]?.id && (
          <OveragePricing regionId={clusterRegion?.[0]?.id} />
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
            disabled:
              !formik.values.cluster ||
              (showGDPRCheckbox && !hasSignedAgreement),
            label: 'Create Bucket',
            loading: isLoading,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />

        <EnableObjectStorageModal
          handleSubmit={formik.handleSubmit}
          onClose={() => setIsEnableObjDialogOpen(false)}
          open={isEnableObjDialogOpen}
          regionId={clusterRegion?.[0]?.id}
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
