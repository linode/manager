import { AFFINITY_TYPES } from '@linode/api-v4';
import { updatePlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useFormValidateOnChange } from 'src/hooks/useFormValidateOnChange';
import { usePlacementGroupData } from 'src/hooks/usePlacementGroupsData';
import { useMutatePlacementGroup } from 'src/queries/placementGroups';
import { usePlacementGroupQuery } from 'src/queries/placementGroups';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import type { PlacementGroupsEditDrawerProps } from './types';
import type { UpdatePlacementGroupPayload } from '@linode/api-v4';

export const PlacementGroupsEditDrawer = (
  props: PlacementGroupsEditDrawerProps
) => {
  const { onClose, onPlacementGroupEdit, open } = props;
  const { id } = useParams<{ id: string }>();
  const { data: selectedPlacementGroup } = usePlacementGroupQuery(+id);
  const { region } = usePlacementGroupData({
    placementGroup: selectedPlacementGroup,
  });
  const { error, mutateAsync } = useMutatePlacementGroup(
    selectedPlacementGroup?.id ?? -1
  );
  const { enqueueSnackbar } = useSnackbar();
  const {
    hasFormBeenSubmitted,
    setHasFormBeenSubmitted,
  } = useFormValidateOnChange();

  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    status,
    values,
  } = useFormik<UpdatePlacementGroupPayload>({
    enableReinitialize: true,
    initialValues: {
      label: selectedPlacementGroup?.label ?? '',
    },
    async onSubmit(values, { setErrors, setStatus, setSubmitting }) {
      setHasFormBeenSubmitted(false);
      setStatus(undefined);
      setErrors({});
      const payload = { ...values };

      try {
        const response = await mutateAsync(payload);

        setSubmitting(false);
        enqueueSnackbar(
          `Placement Group ${payload.label} successfully updated`,
          {
            variant: 'success',
          }
        );

        if (onPlacementGroupEdit) {
          onPlacementGroupEdit(response);
        }
        onClose();
      } catch {
        const mapErrorToStatus = () =>
          setStatus({ generalError: getErrorMap([], error).none });
        setSubmitting(false);
        handleFieldErrors(setErrors, error ?? []);
        handleGeneralErrors(
          mapErrorToStatus,
          error || [],
          'Error updating Placement Group.'
        );
      }
    },
    validateOnBlur: false,
    validateOnChange: hasFormBeenSubmitted,
    validationSchema: updatePlacementGroupSchema,
  });

  React.useEffect(() => {
    resetForm();
    setHasFormBeenSubmitted(false);
  }, [open, resetForm]);

  React.useEffect(() => {
    if (isSubmitting) {
      setHasFormBeenSubmitted(isSubmitting);
    }
  }, [isSubmitting]);

  const generalError = status?.generalError;

  return (
    <Drawer
      title={
        selectedPlacementGroup
          ? `Edit Placement Group ${selectedPlacementGroup.label} (${
              AFFINITY_TYPES[selectedPlacementGroup.affinity_type]
            })`
          : ''
      }
      onClose={onClose}
      open={open}
    >
      {generalError && <Notice text={generalError} variant="error" />}
      <Typography>
        <strong>Region: </strong>
        {region ? `${region.label} (${region.id})` : 'Unknown'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={1}>
          <TextField
            inputProps={{
              autoFocus: true,
            }}
            aria-label="Label for the Placement Group"
            disabled={false}
            errorText={errors.label}
            label="Label"
            name="label"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.label}
          />

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Edit',
              loading: isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onClose,
            }}
            sx={{ pt: 4 }}
          />
        </Stack>
      </form>
    </Drawer>
  );
};
