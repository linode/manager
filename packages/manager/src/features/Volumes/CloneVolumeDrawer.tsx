import { Volume } from '@linode/api-v4';
import { CloneVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { useCloneVolumeMutation } from 'src/queries/volumes';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { PricePanel } from './VolumeDrawer/PricePanel';

interface Props {
  onClose: () => void;
  open: boolean;
  volume: Volume | undefined;
}

const initialValues = { label: '' };

export const CloneVolumeDrawer = (props: Props) => {
  const { onClose, open, volume } = props;

  const { mutateAsync: cloneVolume } = useCloneVolumeMutation();

  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    touched,
    values,
  } = useFormik({
    initialValues,
    onSubmit: (values, { setErrors, setStatus, setSubmitting }) => {
      cloneVolume({ label: values.label, volumeId: volume?.id ?? -1 })
        .then((_) => {
          onClose();
          resetEventsPolling();
        })
        .catch((errorResponse) => {
          const defaultMessage = `Unable to clone this volume at this time. Please try again later.`;
          const mapErrorToStatus = () =>
            setStatus({
              generalError: getErrorMap([], errorResponse).none,
            });

          setSubmitting(false);
          handleFieldErrors(setErrors, errorResponse);
          handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
        });
    },
    validationSchema: CloneVolumeSchema,
  });

  return (
    <Drawer onClose={onClose} open={open} title="Clone Volume">
      <form onSubmit={handleSubmit}>
        <Typography variant="body1">
          The newly created volume will be an exact clone of{' '}
          <b>{volume?.label}</b>. It will have a size of {volume?.size} GB and
          be available in {volume?.region}.
        </Typography>
        <TextField
          errorText={touched.label ? errors.label : undefined}
          label="Label"
          name="label"
          onBlur={handleBlur}
          onChange={handleChange}
          required
          value={values.label}
        />
        <PricePanel
          currentSize={volume?.size ?? -1}
          regionId={volume?.region ?? ''}
          value={volume?.size ?? -1}
        />
        <ActionsPanel
          primaryButtonProps={{
            label: 'Clone Volume',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: () => {
              resetForm();
              onClose();
            },
          }}
        />
      </form>
    </Drawer>
  );
};
