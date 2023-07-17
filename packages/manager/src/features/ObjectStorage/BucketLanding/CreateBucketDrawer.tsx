import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import {
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import { useAccountSettings } from 'src/queries/accountSettings';
import {
  useCreateBucketMutation,
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';
import { useProfile } from 'src/queries/profile';
import { sendCreateBucketEvent } from 'src/utilities/analytics';
import { getErrorMap } from 'src/utilities/errorUtils';
import { isEURegion } from 'src/utilities/formatRegion';

import EnableObjectStorageModal from '../EnableObjectStorageModal';
import ClusterSelect from './ClusterSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBucketDrawer = (props: Props) => {
  const { data: profile } = useProfile();
  const { isOpen, onClose } = props;
  const isRestrictedUser = profile?.restricted;
  const { data: clusters } = useObjectStorageClusters();
  const { data: buckets } = useObjectStorageBuckets(clusters);
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

  const formik = useFormik({
    initialValues: {
      cluster: '',
      label: '',
    },
    async onSubmit(values) {
      await createBucket(values);
      sendCreateBucketEvent(values.cluster);
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

  const showAgreement = Boolean(
    !profile?.restricted &&
      agreements?.eu_model === false &&
      isEURegion(formik.values.cluster)
  );

  const errorMap = getErrorMap(['label', 'cluster'], error);

  return (
    <Drawer onClose={onClose} open={isOpen} title="Create Bucket">
      <form onSubmit={onSubmit}>
        {isRestrictedUser && (
          <Notice
            data-qa-permissions-notice
            error
            important
            text="You don't have permissions to create a Bucket. Please contact an account administrator for details."
          />
        )}
        {Boolean(errorMap.none) && <Notice error text={errorMap.none} />}
        <TextField
          data-qa-cluster-label
          data-testid="label"
          disabled={isRestrictedUser}
          errorText={errorMap.label ?? formik.errors.label}
          label="Label"
          name="label"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <ClusterSelect
          data-qa-cluster-select
          disabled={isRestrictedUser}
          error={errorMap.cluster}
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue('cluster', value)}
          selectedCluster={formik.values.cluster}
        />
        {showAgreement ? (
          <StyledEUAgreementCheckbox
            onChange={(e) =>
              updateAccountAgreements({ eu_model: e.target.checked })
            }
            checked={Boolean(agreements?.eu_model)}
          />
        ) : null}
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            data-testid="create-bucket-button"
            loading={isLoading}
            type="submit"
          >
            Create Bucket
          </Button>
        </ActionsPanel>
        <EnableObjectStorageModal
          handleSubmit={formik.handleSubmit}
          onClose={() => setIsEnableObjDialogOpen(false)}
          open={isEnableObjDialogOpen}
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
