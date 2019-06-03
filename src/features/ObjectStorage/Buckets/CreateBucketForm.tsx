import { WithStyles } from '@material-ui/core/styles';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { compose } from 'recompose';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import bucketContainer from 'src/containers/bucket.container';
import bucketRequestsContainer, {
  BucketsRequests
} from 'src/containers/bucketRequests.container';
// @todo: Extract these utils out of Volumes
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/features/Volumes/VolumeDrawer/utils';
// @todo: Extract ActionPanel out of Volumes
import BucketsActionPanel from 'src/features/Volumes/VolumeDrawer/VolumesActionsPanel';
import { CreateBucketSchema } from 'src/services/objectStorage/buckets.schema';
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
  onClose: () => void;
  onSuccess: (bucketLabel: string) => void;
}

type CombinedProps = Props & BucketsRequests & WithStyles<ClassNames>;

export const CreateBucketForm: React.StatelessComponent<
  CombinedProps
> = props => {
  const { onClose, onSuccess, createBucket } = props;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateBucketSchema}
      onSubmit={(
        values,
        { setSubmitting, setStatus, setErrors, resetForm }
      ) => {
        const { cluster, label } = values;

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

        return (
          <Form>
            {/* `status` holds generalError messages */}
            {status && <Notice error>{status.generalError}</Notice>}

            <TextField
              data-qa-cluster-label
              label="Label"
              name="label"
              errorText={touched.label ? errors.label : undefined}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
            />

            <ClusterSelect
              data-qa-cluster-select
              error={touched.cluster ? errors.cluster : undefined}
              onBlur={handleBlur}
              onChange={value => setFieldValue('cluster', value)}
              selectedCluster={values.cluster}
            />

            <BucketsActionPanel
              data-qa-bucket-actions-panel
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={() => {
                resetForm();
                onClose();
              }}
            />
          </Form>
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

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  bucketRequestsContainer,
  bucketContainer
);

export default enhanced(CreateBucketForm);
