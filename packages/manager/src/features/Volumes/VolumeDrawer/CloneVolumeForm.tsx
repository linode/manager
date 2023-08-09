import { CloneVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { Form, Formik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { useCloneVolumeMutation } from 'src/queries/volumes';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import LabelField from './LabelField';
import NoticePanel from './NoticePanel';
import { PricePanel } from './PricePanel';

interface Props {
  onClose: () => void;
  volumeId: number;
  volumeLabel: string;
  volumeRegion: string;
  volumeSize: number;
}

const initialValues = { label: '' };

export const CloneVolumeForm = (props: Props) => {
  const { onClose, volumeId, volumeLabel, volumeRegion, volumeSize } = props;

  const { mutateAsync: cloneVolume } = useCloneVolumeMutation();

  return (
    <Formik
      onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
        cloneVolume({ label: values.label, volumeId })
          .then((_) => {
            onClose();
            resetEventsPolling();
          })
          .catch((errorResponse) => {
            const defaultMessage = `Unable to clone this volume at this time. Please try again later.`;
            const mapErrorToStatus = () =>
              setStatus({ generalError: getErrorMap([], errorResponse).none });

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
      validationSchema={CloneVolumeSchema}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        resetForm,
        status,
        touched,
        values,
      }) => {
        return (
          <Form>
            <Typography variant="body1">
              The newly created volume will be an exact clone of{' '}
              <b>{volumeLabel}</b>. It will have a size of {volumeSize} GB and
              be available in {volumeRegion}.
            </Typography>
            {status && (
              <NoticePanel
                error={status.generalError}
                success={status.success}
              />
            )}
            <LabelField
              error={touched.label ? errors.label : undefined}
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
            />
            <PricePanel currentSize={volumeSize} value={volumeSize} />
            <ActionsPanel
              primaryButtonProps={
                handleSubmit
                  ? {
                      'data-testid': 'submit',
                      label: 'Clone Volume',
                      loading: isSubmitting,
                      onClick: () => handleSubmit(),
                    }
                  : undefined
              }
              secondaryButtonProps={
                onClose
                  ? {
                      'data-testid': 'cancel',
                      label: 'Cancel',
                      onClick: () => {
                        resetForm();
                        onClose();
                      },
                    }
                  : undefined
              }
            />
          </Form>
        );
      }}
    </Formik>
  );
};
