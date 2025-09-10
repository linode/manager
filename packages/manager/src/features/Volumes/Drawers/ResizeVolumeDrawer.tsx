import { useResizeVolumeMutation, useVolumeTypesQuery } from '@linode/queries';
import { ActionsPanel, Drawer, Notice } from '@linode/ui';
import { ResizeVolumeSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import React from 'react';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useEventsPollingActions } from 'src/queries/events/events';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';

import { PricePanel } from './VolumeDrawer/PricePanel';
import { SizeField } from './VolumeDrawer/SizeField';

import type { APIError, Volume } from '@linode/api-v4';

interface Props {
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
  volume: undefined | Volume;
  volumeError?: APIError[] | null;
}

export const ResizeVolumeDrawer = (props: Props) => {
  const { isFetching, onClose: _onClose, open, volume, volumeError } = props;

  const { data: permissions } = usePermissions(
    'volume',
    ['resize_volume'],
    volume?.id
  );
  const canResizeVolume = permissions?.resize_volume;

  const { mutateAsync: resizeVolume } = useResizeVolumeMutation();

  const { checkForNewEvents } = useEventsPollingActions();

  const validationSchema = ResizeVolumeSchema(volume?.size ?? -1);

  const { enqueueSnackbar } = useSnackbar();

  const { data: types, isError, isLoading } = useVolumeTypesQuery();

  const isInvalidPrice = !types || isError;

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
  } = useFormik({
    enableReinitialize: true,
    initialValues: { size: volume?.size },
    onSubmit: (values, { setErrors, setStatus, setSubmitting }) => {
      setSubmitting(true);

      resizeVolume({ size: Number(values.size), volumeId: volume?.id ?? -1 })
        .then((_) => {
          setSubmitting(false);
          checkForNewEvents();
          enqueueSnackbar(`Volume scheduled to be resized.`, {
            variant: 'success',
          });
          onClose();
        })
        .catch((errorResponse) => {
          setSubmitting(false);
          handleFieldErrors(setErrors, errorResponse);
          handleGeneralErrors(
            setStatus,
            errorResponse,
            `Unable to resize this volume at this time. Please try again later.`
          );
        });
    },
    validationSchema,
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
      title="Resize Volume"
    >
      <form onSubmit={handleSubmit}>
        {!canResizeVolume && (
          <Notice
            spacingBottom={0}
            text="You don't have permission to resize this volume."
            variant="error"
          />
        )}
        {error && <Notice text={error} variant="error" />}
        <SizeField
          disabled={!canResizeVolume}
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
            disabled: !canResizeVolume || !dirty || isInvalidPrice,
            label: 'Resize Volume',
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
