import { useGrants, useUpdateVolumeMutation } from '@linode/queries';
import {
  ActionsPanel,
  Box,
  Checkbox,
  Drawer,
  Notice,
  TextField,
} from '@linode/ui';
import { UpdateVolumeSchema } from '@linode/validation';
import { useFormik } from 'formik';
import React from 'react';

import { BLOCK_STORAGE_ENCRYPTION_SETTING_IMMUTABLE_COPY } from 'src/components/Encryption/constants';
import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import type { APIError, Volume } from '@linode/api-v4';

interface Props {
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
  volume: undefined | Volume;
  volumeError?: APIError[] | null;
}

export const EditVolumeDrawer = (props: Props) => {
  const { isFetching, onClose: _onClose, open, volume, volumeError } = props;

  const { data: grants } = useGrants();

  const { mutateAsync: updateVolume } = useUpdateVolumeMutation();

  const { isBlockStorageEncryptionFeatureEnabled } =
    useIsBlockStorageEncryptionFeatureEnabled();

  const isReadOnly =
    grants !== undefined &&
    grants.volume.find((grant) => grant.id === volume?.id)?.permissions ===
      'read_only';

  const {
    dirty,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    status: error,
    values,
    isValid,
  } = useFormik({
    enableReinitialize: true,
    initialValues: { label: volume?.label ?? '', tags: volume?.tags ?? [] },
    async onSubmit(values, { setErrors, setStatus }) {
      try {
        await updateVolume({
          label: values.label,
          tags: values.tags,
          volumeId: volume?.id ?? -1,
        });

        onClose();
      } catch (error) {
        handleFieldErrors(setErrors, error);
        handleGeneralErrors(
          setStatus,
          error,
          `Unable to edit this Volume at this time. Please try again later.`
        );
      }
    },
    validationSchema: UpdateVolumeSchema,
  });

  const onClose = () => {
    _onClose();
    resetForm();
  };

  return (
    <Drawer
      error={volumeError}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title="Edit Volume"
    >
      <form onSubmit={handleSubmit}>
        {isReadOnly && (
          <Notice
            spacingBottom={0}
            text="You don't have permission to edit this volume."
            variant="error"
          />
        )}
        {error && <Notice text={error} variant="error" />}

        <TextField
          disabled={isReadOnly}
          errorText={errors.label}
          label="Label"
          name="label"
          onBlur={handleBlur}
          onChange={handleChange}
          required
          value={values.label}
        />

        {isBlockStorageEncryptionFeatureEnabled && (
          <Box
            sx={{
              marginLeft: '2px',
              marginTop: '16px',
            }}
          >
            <Checkbox
              checked={volume?.encryption === 'enabled'}
              disabled
              text="Encrypt Volume"
              toolTipText={BLOCK_STORAGE_ENCRYPTION_SETTING_IMMUTABLE_COPY}
            />
          </Box>
        )}

        <ActionsPanel
          primaryButtonProps={{
            disabled: isReadOnly || !isValid || !dirty,
            label: 'Save Changes',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
