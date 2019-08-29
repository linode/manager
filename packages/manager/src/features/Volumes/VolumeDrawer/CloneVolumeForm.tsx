import { Form, Formik } from 'formik';
import { CloneVolumeSchema } from 'linode-js-sdk/lib/volumes';
import * as React from 'react';
import { compose } from 'recompose';
import Typography from 'src/components/core/Typography';
import withVolumesRequests, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import { resetEventsPolling } from 'src/events';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import LabelField from './LabelField';
import NoticePanel from './NoticePanel';
import PricePanel from './PricePanel';
import VolumesActionsPanel from './VolumesActionsPanel';

interface Props {
  onClose: () => void;
  volumeId: number;
  volumeLabel: string;
  volumeSize: number;
  volumeRegion: string;
}

type CombinedProps = Props & VolumesRequests;

const validationScheme = CloneVolumeSchema;

const initialValues = { label: '' };

const CloneVolumeForm: React.StatelessComponent<CombinedProps> = props => {
  const {
    onClose,
    volumeId,
    volumeRegion,
    volumeLabel,
    volumeSize,
    cloneVolume
  } = props;
  return (
    <Formik
      validationSchema={validationScheme}
      onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
        cloneVolume({ volumeId, label: values.label })
          .then(response => {
            onClose();
            resetEventsPolling();
          })
          .catch(errorResponse => {
            const defaultMessage = `Unable to clone this volume at this time. Please try again later.`;
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
      initialValues={initialValues}
      render={({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        resetForm,
        status,
        touched,
        values
      }) => {
        return (
          <Form>
            <Typography variant="body2">{`The newly created volume will be an exact clone of ${volumeLabel}. It will have a size of ${volumeSize} GiB and be available in ${volumeRegion}.`}</Typography>
            {status && (
              <NoticePanel
                success={status.success}
                error={status.generalError}
              />
            )}
            <LabelField
              error={touched.label ? errors.label : undefined}
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
            />

            <PricePanel value={volumeSize} currentSize={volumeSize} />

            <VolumesActionsPanel
              onSubmit={handleSubmit}
              onCancel={() => {
                resetForm();
                onClose();
              }}
              isSubmitting={isSubmitting}
            />
          </Form>
        );
      }}
    />
  );
};

const enhanced = compose<CombinedProps, Props>(withVolumesRequests);

export default enhanced(CloneVolumeForm);
