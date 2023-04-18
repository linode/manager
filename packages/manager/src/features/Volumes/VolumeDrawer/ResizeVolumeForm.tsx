import { ResizeVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { Formik } from 'formik';
import * as React from 'react';
import Form from 'src/components/core/Form';
import Notice from 'src/components/Notice';
import { resetEventsPolling } from 'src/eventsPolling';
import { useResizeVolumeMutation } from 'src/queries/volumes';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import NoticePanel from './NoticePanel';
import { PricePanel } from './PricePanel';
import SizeField from './SizeField';
import VolumesActionsPanel from './VolumesActionsPanel';

interface Props {
  onClose: () => void;
  volumeSize: number;
  volumeId: number;
  volumeLabel: string;
  readOnly?: boolean;
  onSuccess: (volumeLabel: string, message?: string) => void;
}

export const ResizeVolumeForm = (props: Props) => {
  const {
    volumeId,
    volumeSize,
    onClose,
    volumeLabel,
    onSuccess,
    readOnly,
  } = props;

  const { mutateAsync: resizeVolume } = useResizeVolumeMutation();

  const initialValues = { size: volumeSize };
  const validationSchema = ResizeVolumeSchema(volumeSize);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(
        values,
        { resetForm, setSubmitting, setStatus, setErrors }
      ) => {
        setSubmitting(true);

        resizeVolume({ volumeId, size: Number(values.size) })
          .then((_) => {
            resetForm({ values: initialValues });
            setSubmitting(false);
            resetEventsPolling();
            onSuccess(volumeLabel, `Volume scheduled to be resized.`);
          })
          .catch((errorResponse) => {
            const defaultMessage = `Unable to resize this volume at this time. Please try again later.`;
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
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        resetForm,
        status,
        values,
      }) => {
        return (
          <Form>
            {status && (
              <NoticePanel
                success={status.success}
                error={status.generalError}
              />
            )}
            {readOnly && (
              <Notice
                text={`You don't have permissions to edit ${volumeLabel}. Please contact an account administrator for details.`}
                error={true}
                important
              />
            )}
            <SizeField
              error={errors.size}
              name="size"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.size}
              resize={volumeSize}
              disabled={readOnly}
            />
            <PricePanel value={values.size} currentSize={volumeSize} />
            <VolumesActionsPanel
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              disabled={readOnly}
              onCancel={() => {
                resetForm();
                onClose();
              }}
              submitText="Resize Volume"
            />
          </Form>
        );
      }}
    </Formik>
  );
};
