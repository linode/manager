import { Volume } from '@linode/api-v4';
import { ResizeVolumeSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { resetEventsPolling } from 'src/eventsPolling';
import { useResizeVolumeMutation } from 'src/queries/volumes';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { PricePanel } from './VolumeDrawer/PricePanel';
import SizeField from './VolumeDrawer/SizeField';

interface Props {
  onClose: () => void;
  open: boolean;
  volume: Volume | undefined;
}

export const ResizeVolumeDrawer = (props: Props) => {
  const { onClose, open, volume } = props;

  const { mutateAsync: resizeVolume } = useResizeVolumeMutation();

  const validationSchema = ResizeVolumeSchema(volume?.size ?? -1);

  const { enqueueSnackbar } = useSnackbar();

  const readOnly = false;

  const {
    dirty,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: { size: volume?.size },
    onSubmit: (values, { setErrors, setStatus, setSubmitting }) => {
      setSubmitting(true);

      resizeVolume({ size: Number(values.size), volumeId: volume?.id ?? -1 })
        .then((_) => {
          setSubmitting(false);
          resetEventsPolling();
          enqueueSnackbar(`Volume scheduled to be resized.`, {
            variant: 'success',
          });
          onClose();
        })
        .catch((errorResponse) => {
          const defaultMessage = `Unable to resize this volume at this time. Please try again later.`;
          const mapErrorToStatus = (generalError: string) =>
            setStatus({ generalError });

          setSubmitting(false);
          handleFieldErrors(setErrors, errorResponse);
          handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
        });
    },
    validationSchema,
  });

  return (
    <Drawer onClose={onClose} open={open} title="Resize Volume">
      <form onSubmit={handleSubmit}>
        <SizeField
          disabled={readOnly}
          error={errors.size}
          name="size"
          onBlur={handleBlur}
          onChange={handleChange}
          regionId={volume?.region ?? ''}
          resize={volume?.size}
          value={values.size ?? -1}
        />
        <PricePanel
          currentSize={volume?.size ?? -1}
          regionId={volume?.region ?? ''}
          value={values.size ?? -1}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: readOnly || !dirty,
            label: 'Resize',
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
