import {
  useCloneVolumeMutation,
  useGrants,
  useVolumeTypesQuery,
} from '@linode/queries';
import {
  ActionsPanel,
  Box,
  Checkbox,
  Drawer,
  Notice,
  TextField,
  Typography,
} from '@linode/ui';
import { CloneVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { useFormik } from 'formik';
import * as React from 'react';

import { BLOCK_STORAGE_CLONING_INHERITANCE_CAVEAT } from 'src/components/Encryption/constants';
import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { useEventsPollingActions } from 'src/queries/events/events';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';

import { PricePanel } from './VolumeDrawer/PricePanel';

import type { Volume } from '@linode/api-v4';

interface Props {
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
  volume: undefined | Volume;
}

const initialValues = { label: '' };

export const CloneVolumeDrawer = (props: Props) => {
  const { isFetching, onClose: _onClose, open, volume } = props;

  const { mutateAsync: cloneVolume } = useCloneVolumeMutation();

  const { checkForNewEvents } = useEventsPollingActions();

  const { data: grants } = useGrants();
  const { data: types, isError, isLoading } = useVolumeTypesQuery();

  const { isBlockStorageEncryptionFeatureEnabled } =
    useIsBlockStorageEncryptionFeatureEnabled();

  // Even if a restricted user has the ability to create Volumes, they
  // can't clone a Volume they only have read only permission on.
  const isReadOnly =
    grants !== undefined &&
    grants.volume.find((grant) => grant.id === volume?.id)?.permissions ===
      'read_only';

  const isInvalidPrice = !types || isError;

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
    async onSubmit(values, { setErrors, setStatus }) {
      try {
        await cloneVolume({ label: values.label, volumeId: volume?.id ?? -1 });
        onClose();
        checkForNewEvents();
      } catch (error) {
        handleFieldErrors(setErrors, error);
        handleGeneralErrors(
          setStatus,
          error,
          `Unable to clone this volume at this time. Please try again later.`
        );
      }
    },
    validationSchema: CloneVolumeSchema,
  });

  const onClose = () => {
    _onClose();
    resetForm();
  };

  return (
    <Drawer
      isFetching={isFetching}
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title="Clone Volume"
    >
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
              toolTipText={BLOCK_STORAGE_CLONING_INHERITANCE_CAVEAT}
            />
          </Box>
        )}
        <PricePanel
          currentSize={volume?.size ?? -1}
          regionId={volume?.region ?? ''}
          value={volume?.size ?? -1}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: isReadOnly || isInvalidPrice,
            label: 'Clone Volume',
            loading: isSubmitting,
            tooltipText:
              !isLoading && isInvalidPrice
                ? PRICES_RELOAD_ERROR_NOTICE_TEXT
                : '',
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
