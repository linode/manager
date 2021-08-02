import { Formik } from 'formik';
import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import { CreateBucketSchema } from '@linode/validation/lib/buckets.schema';
import * as React from 'react';
import Form from 'src/components/core/Form';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import bucketContainer, {
  StateProps as BucketContainerProps,
} from 'src/containers/bucket.container';
import bucketRequestsContainer, {
  BucketsRequests,
} from 'src/containers/bucketRequests.container';
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
import { compose } from 'recompose';

type ClassNames = 'root' | 'textWrapper';
const styles = (theme: Theme) =>
  createStyles({
    root: {},
    textWrapper: {
      marginBottom: theme.spacing(1) + 2,
    },
  });

interface Props {
  isRestrictedUser: boolean;
  onClose: () => void;
  onSuccess: (bucketLabel: string) => void;
}

type CombinedProps = Props &
  BucketContainerProps &
  BucketsRequests &
  WithStyles<ClassNames>;

export const CreateBucketForm: React.FC<CombinedProps> = (props) => {
  const {
    isRestrictedUser,
    onClose,
    onSuccess,
    createBucket,
    bucketsData,
  } = props;

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const {
    data: accountSettings,
    refetch: requestAccountSettings,
  } = useAccountSettings();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateBucketSchema}
      onSubmit={(
        values,
        { setSubmitting, setStatus, setErrors, resetForm }
      ) => {
        const { cluster, label } = values;

        if (isDuplicateBucket(bucketsData, label, cluster)) {
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

            // If our Redux Store says that the user doesn't have OBJ enabled,
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

              <BucketsActionPanel
                data-qa-bucket-actions-panel
                isSubmitting={isSubmitting}
                onSubmit={beforeSubmit}
                onCancel={() => {
                  resetForm();
                  onClose();
                }}
                disabled={isRestrictedUser}
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

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  bucketRequestsContainer,
  bucketContainer
);

export default enhanced(CreateBucketForm);

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
