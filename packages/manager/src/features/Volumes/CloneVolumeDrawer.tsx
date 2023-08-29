import { Volume } from '@linode/api-v4';
import { CloneVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { useGrants } from 'src/queries/profile';
import { useCloneVolumeMutation } from 'src/queries/volumes';
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

  const { data: grants } = useGrants();

  // Even if a restricted user has the ability to create Volumes, they
  // can't clone a Volume they only have read only permission on.
  const isReadOnly =
    grants !== undefined &&
    grants.volume.find((grant) => grant.id === volume?.id)?.permissions ===
      'read_only';

  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    status: error,
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
          setSubmitting(false);
          handleFieldErrors(setErrors, errorResponse);
          handleGeneralErrors(
            setStatus,
            errorResponse,
            `Unable to clone this volume at this time. Please try again later.`
          );
        });
    },
    validationSchema: CloneVolumeSchema,
  });

  return (
    <Drawer onClose={onClose} open={open} title="Clone Volume">
      <form onSubmit={handleSubmit}>
        {isReadOnly && (
          <Notice
            spacingBottom={12}
            text="You don't have permission to clone this volume."
            variant="error"
          />
        )}
        {error && <Notice text={error} variant="error" />}
        <Typography variant="body1">
          The newly created volume will be an exact clone of{' '}
          <b>{volume?.label}</b>. It will have a size of {volume?.size} GB and
          be available in {volume?.region}.
        </Typography>
        <TextField
          disabled={isReadOnly}
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
            disabled: isReadOnly,
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
