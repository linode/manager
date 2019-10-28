import { Form, Formik } from 'formik';
import { AccountSettings } from 'linode-js-sdk/lib/account';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import bucketContainer, {
  StateProps as BucketContainerProps
} from 'src/containers/bucket.container';
import bucketRequestsContainer, {
  BucketsRequests
} from 'src/containers/bucketRequests.container';
// @todo: Extract ActionPanel out of Volumes
import BucketsActionPanel from 'src/features/Volumes/VolumeDrawer/VolumesActionsPanel';
import { CreateBucketSchema } from 'src/services/objectStorage/buckets.schema';
import { ApplicationState } from 'src/store';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import { sendCreateBucketEvent } from 'src/utilities/ga';
import EnableObjectStorageModal from '../EnableObjectStorageModal';
import { confirmObjectStorage } from '../utilities';
import ClusterSelect from './ClusterSelect';

type ClassNames = 'root' | 'textWrapper';
const styles = (theme: Theme) =>
  createStyles({
    root: {},
    textWrapper: {
      marginBottom: theme.spacing(1) + 2
    }
  });

interface Props {
  isRestrictedUser: boolean;
  onClose: () => void;
  onSuccess: (bucketLabel: string) => void;
}

interface ReduxStateProps {
  object_storage: AccountSettings['object_storage'];
}

type CombinedProps = Props &
  BucketContainerProps &
  BucketsRequests &
  WithStyles<ClassNames> &
  ReduxStateProps;

export const CreateBucketForm: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    isRestrictedUser,
    onClose,
    onSuccess,
    createBucket,
    bucketsData
  } = props;

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

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
            label: `You already have a bucket named ${label} in this region.`
          });
          setSubmitting(false);
          return;
        }

        setSubmitting(true);

        // `status` holds general error messages
        setStatus(undefined);

        createBucket({
          label,
          cluster
        })
          .then(({ label: bucketLabel }) => {
            resetForm(initialValues);
            setSubmitting(false);
            onSuccess(bucketLabel);

            // @analytics
            sendCreateBucketEvent(cluster);
          })
          .catch(errorResponse => {
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
      render={formikProps => {
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
          values
        } = formikProps;

        const beforeSubmit = () => {
          confirmObjectStorage<FormState>(
            props.object_storage,
            formikProps,
            () => setDialogOpen(true)
          );
        };

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
              />

              <ClusterSelect
                data-qa-cluster-select
                error={touched.cluster ? errors.cluster : undefined}
                onBlur={handleBlur}
                onChange={value => setFieldValue('cluster', value)}
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
    />
  );
};
interface FormState {
  label: string;
  cluster: string;
}

const initialValues: FormState = {
  label: '',
  cluster: ''
};

const mapStateToProps = (state: ApplicationState) => {
  return {
    object_storage: pathOr(
      false,
      ['data', 'object_storage'],
      state.__resources.accountSettings
    )
  };
};

const connected = connect(mapStateToProps);

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  bucketRequestsContainer,
  bucketContainer,
  connected
);

export default enhanced(CreateBucketForm);

// Returns `true` if a bucket with the same label and clusterId already exist
// in the given bucket data.
export const isDuplicateBucket = (
  bucketsData: Linode.Bucket[],
  label: string,
  cluster: string
) => {
  return (
    bucketsData.findIndex(
      bucket => bucket.cluster === cluster && bucket.label === label
    ) > -1
  );
};
