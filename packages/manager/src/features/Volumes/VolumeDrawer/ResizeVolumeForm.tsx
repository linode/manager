import { ResizeVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { Form, Formik } from 'formik';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
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

import type { FlagSet } from 'src/featureFlags';

interface Props {
  flags: FlagSet;
  onClose: () => void;
  onSuccess: (volumeLabel: string, message?: string) => void;
  readOnly?: boolean;
  volumeId: number;
  volumeLabel: string;
  volumeRegion: string;
  volumeSize: number;
}

export const ResizeVolumeForm = (props: Props) => {
  const {
    flags,
    onClose,
    onSuccess,
    readOnly,
    volumeId,
    volumeLabel,
    volumeRegion,
    volumeSize,
  } = props;

  const { mutateAsync: resizeVolume } = useResizeVolumeMutation();

  const initialValues = { size: volumeSize };
  const validationSchema = ResizeVolumeSchema(volumeSize);

  return (
    <Formik
      onSubmit={(
        values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        setSubmitting(true);

        resizeVolume({ size: Number(values.size), volumeId })
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
      initialValues={initialValues}
      validationSchema={validationSchema}
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
                error={status.generalError}
                success={status.success}
              />
            )}
            {readOnly && (
              <Notice
                error={true}
                important
                text={`You don't have permissions to edit ${volumeLabel}. Please contact an account administrator for details.`}
              />
            )}

            {/* {console.log('regionId', volumeRegion)} */}

            <SizeField
              disabled={readOnly}
              error={errors.size}
              flags={flags}
              name="size"
              onBlur={handleBlur}
              onChange={handleChange}
              regionId={volumeRegion}
              resize={volumeSize}
              value={values.size}
            />

            <PricePanel
              currentSize={volumeSize}
              flags={flags}
              regionId={volumeRegion}
              value={values.size}
            />
            <VolumesActionsPanel
              onCancel={() => {
                resetForm();
                onClose();
              }}
              disabled={readOnly}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              submitText="Resize Volume"
            />
          </Form>
        );
      }}
    </Formik>
  );
};
