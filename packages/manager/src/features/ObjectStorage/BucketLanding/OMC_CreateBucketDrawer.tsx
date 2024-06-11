import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
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
  useObjectStorageTypesQuery,
} from 'src/queries/objectStorage';
import { useProfile } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { sendCreateBucketEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getErrorMap } from 'src/utilities/errorUtils';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';

import { EnableObjectStorageModal } from '../EnableObjectStorageModal';
import { BucketRegions } from './BucketRegions';
import { StyledEUAgreementCheckbox } from './OMC_CreateBucketDrawer.styles';
import { OveragePricing } from './OveragePricing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OMC_CreateBucketDrawer = (props: Props) => {
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

  const regionsSupportingObjectStorage = regions?.filter((region) =>
    region.capabilities.includes('Object Storage')
  );

  const { data: buckets } = useObjectStorageBuckets({
    isObjMultiClusterEnabled,
    regions: regionsSupportingObjectStorage,
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
      label: '',
      region: '',
    },
    async onSubmit(values) {
      await createBucket(values);
      sendCreateBucketEvent(values.region);
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
        (b) => b.label === values.label && b.region === values.region
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

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId: formik.values.region ?? '',
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
        <BucketRegions
          disabled={isRestrictedUser}
          error={errorMap.cluster}
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue('region', value)}
          required
          selectedRegion={formik.values.region}
        />
        {formik.values.region && (
          <OveragePricing regionId={formik.values.region} />
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
              !formik.values.region ||
              (showGDPRCheckbox && !hasSignedAgreement) ||
              isErrorTypes,
            label: 'Create Bucket',
            loading:
              isLoading || Boolean(formik.values.region && isLoadingTypes),
            tooltipText:
              !isLoadingTypes && isInvalidPrice
                ? PRICES_RELOAD_ERROR_NOTICE_TEXT
                : '',
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />

        <EnableObjectStorageModal
          handleSubmit={formik.handleSubmit}
          onClose={() => setIsEnableObjDialogOpen(false)}
          open={isEnableObjDialogOpen}
          regionId={formik.values.region}
        />
      </form>
    </Drawer>
  );
};
