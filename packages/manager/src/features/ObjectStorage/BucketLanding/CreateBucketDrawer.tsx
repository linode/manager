import * as React from 'react';
import Drawer from 'src/components/Drawer';
import { useProfile } from 'src/queries/profile';
import { useFormik } from 'formik';
import {
  useCreateBucketMutation,
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';
import { isEURegion } from 'src/utilities/formatRegion';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { getErrorMap } from 'src/utilities/errorUtils';
import ClusterSelect from './ClusterSelect';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import EnableObjectStorageModal from '../EnableObjectStorageModal';
import { useAccountSettings } from 'src/queries/accountSettings';
import {
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';

const useStyles = makeStyles((theme: Theme) => ({
  textWrapper: {
    marginBottom: theme.spacing(1.25),
  },
  agreement: {
    marginTop: theme.spacing(3),
    marginButton: theme.spacing(3),
  },
}));

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBucketDrawer = (props: Props) => {
  const classes = useStyles();
  const { data: profile } = useProfile();
  const { isOpen, onClose } = props;
  const isRestrictedUser = profile?.restricted;

  const { data: clusters } = useObjectStorageClusters();
  const { data: buckets } = useObjectStorageBuckets(clusters);

  const {
    mutateAsync: createBucket,
    isLoading,
    error,
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
      label: '',
      cluster: '',
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
    async onSubmit(values) {
      await createBucket(values);
      onClose();
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
            error
            important
            text="You don't have permissions to create a Bucket. Please contact an account administrator for details."
            data-qa-permissions-notice
          />
        )}
        <TextField
          data-qa-cluster-label
          label="Label"
          name="label"
          errorText={errorMap.label ?? formik.errors.label}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.label}
          disabled={isRestrictedUser}
          data-testid="label"
        />
        <ClusterSelect
          data-qa-cluster-select
          error={formik.touched.cluster ? errorMap.cluster : undefined}
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue('cluster', value)}
          selectedCluster={formik.values.cluster}
          disabled={isRestrictedUser}
        />
        {showAgreement ? (
          <EUAgreementCheckbox
            className={classes.agreement}
            checked={Boolean(agreements?.eu_model)}
            onChange={(e) =>
              updateAccountAgreements({ eu_model: e.target.checked })
            }
          />
        ) : null}
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button buttonType="primary" type="submit" loading={isLoading}>
            Create Bucket
          </Button>
        </ActionsPanel>
        <EnableObjectStorageModal
          open={isEnableObjDialogOpen}
          onClose={() => setIsEnableObjDialogOpen(false)}
          handleSubmit={formik.handleSubmit}
        />
      </form>
    </Drawer>
  );
};
