import { Formik } from 'formik';
import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import { CreateBucketSchema } from '@linode/validation/lib/buckets.schema';
import * as React from 'react';
import Form from 'src/components/core/Form';
import { makeStyles, Theme } from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
// @todo: Extract ActionPanel out of Volumes
import BucketsActionPanel from 'src/features/Volumes/VolumeDrawer/VolumesActionsPanel';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { sendCreateBucketEvent } from 'src/utilities/ga';
import EnableObjectStorageModal from '../EnableObjectStorageModal';
import { confirmObjectStorage } from '../utilities';
import ClusterSelect from './ClusterSelect';
import { useAccountSettings } from 'src/queries/accountSettings';
import { isEURegion } from 'src/utilities/formatRegion';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import { useProfile } from 'src/queries/profile';
import {
  useCreateBucketMutation,
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';

const useStyles = makeStyles((theme: Theme) => ({
  textWrapper: {
    marginBottom: theme.spacing(1) + 2,
  },
  agreement: {
    marginTop: theme.spacing(3),
    marginButton: theme.spacing(3),
  },
}));

interface Props {
  isRestrictedUser: boolean;
  onClose: () => void;
  onSuccess: (bucketLabel: string) => void;
}

export const CreateBucketForm: React.FC<Props> = (props) => {
  const { isRestrictedUser, onClose, onSuccess } = props;

  const {
    data: accountSettings,
    refetch: requestAccountSettings,
  } = useAccountSettings();

  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [hasSignedAgreement, setHasSignedAgreement] = React.useState<boolean>(
    false
  );
  const { data: agreements } = useAccountAgreements();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const { data: profile } = useProfile();
  const { data: clusters } = useObjectStorageClusters();
  const { data: bucketsResponse } = useObjectStorageBuckets(clusters);
  const { mutateAsync: createBucket } = useCreateBucketMutation();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateBucketSchema}
      onSubmit={(
        values,
        { setSubmitting, setStatus, setErrors, resetForm }
      ) => {
        const { cluster, label } = values;

        if (isDuplicateBucket(bucketsResponse?.buckets || [], label, cluster)) {
          setErrors({
            label: `You already have a bucket named ${label} in this region.`,
          });
          setSubmitting(false);
          return;
        }

        setSubmitting(true);

        // `status` holds general error messages
        setStatus(undefined);

        createBucket({
          label,
          cluster,
        })
          .then(({ label: bucketLabel }) => {
            resetForm({ values: initialValues });
            setSubmitting(false);
            onSuccess(bucketLabel);

            if (hasSignedAgreement) {
              updateAccountAgreements({
                eu_model: true,
                privacy_policy: true,
              }).catch(reportAgreementSigningError);
            }

            // If our React Query cache says that the user doesn't have OBJ enabled,
            // it probably means they have just enabled it with the creation
            // of this bucket. In that case, update the Redux Store so that
            // subsequently created buckets don't need to go through the
            // confirmation flow.
            if (accountSettings?.object_storage === 'disabled') {
              requestAccountSettings();
            }

            // @analytics
            sendCreateBucketEvent(cluster);
          })
          .catch((errorResponse) => {
            // We also need to refresh account settings on failure, since, depending
            // on the error, Object Storage service might have actually been enabled.
            if (accountSettings?.object_storage === 'disabled') {
              requestAccountSettings();
            }

            const defaultMessage = `Unable to create a Bucket. Please try again later.`;
            const mapErrorToStatus = (generalError: string) =>
              setStatus({ generalError });

            setSubmitting(false);
            handleFieldErrors(setErrors, errorResponse);
            handleGeneralErrors(
              mapErrorToStatus,
              errorResponse,
              defaultMessage
            );
          });
      }}
    >
      {(formikProps) => {
        const beforeSubmit = () => {
          confirmObjectStorage<FormState>(
            accountSettings?.object_storage || 'active',
            formikProps,
            () => setDialogOpen(true)
          );
        };

        const {
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          resetForm,
          setFieldValue,
          status,
          touched,
          values,
        } = formikProps;

        const showAgreement = Boolean(
          !profile?.restricted &&
            agreements?.eu_model === false &&
            isEURegion(values.cluster)
        );

        return (
          <>
            <Form>
              {/* `status` holds generalError messages */}
              {status && <Notice error>{status.generalError}</Notice>}

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
                errorText={touched.label ? errors.label : undefined}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.label}
                disabled={isRestrictedUser}
                data-testid="label"
              />

              <ClusterSelect
                data-qa-cluster-select
                error={touched.cluster ? errors.cluster : undefined}
                onBlur={handleBlur}
                onChange={(value) => setFieldValue('cluster', value)}
                selectedCluster={values.cluster}
                disabled={isRestrictedUser}
              />

              {showAgreement ? (
                <EUAgreementCheckbox
                  className={classes.agreement}
                  checked={hasSignedAgreement}
                  onChange={(e) => setHasSignedAgreement(e.target.checked)}
                />
              ) : null}

              <BucketsActionPanel
                data-qa-bucket-actions-panel
                isSubmitting={isSubmitting}
                onSubmit={beforeSubmit}
                onCancel={() => {
                  resetForm();
                  onClose();
                }}
                disabled={
                  isRestrictedUser ||
                  !values.label ||
                  !values.cluster ||
                  (showAgreement && !hasSignedAgreement)
                }
                submitText="Create Bucket"
              />
            </Form>
            <EnableObjectStorageModal
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              handleSubmit={handleSubmit}
            />
          </>
        );
      }}
    </Formik>
  );
};
interface FormState {
  label: string;
  cluster: string;
}

const initialValues: FormState = {
  label: '',
  cluster: '',
};

export default CreateBucketForm;

// Returns `true` if a bucket with the same label and clusterId already exist
// in the given bucket data.
export const isDuplicateBucket = (
  bucketsData: ObjectStorageBucket[],
  label: string,
  cluster: string
) => {
  return (
    bucketsData.findIndex(
      (bucket) => bucket.cluster === cluster && bucket.label === label
    ) > -1
  );
};
