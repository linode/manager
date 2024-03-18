import { AFFINITY_TYPES } from '@linode/api-v4';
import { updatePlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useFormValidateOnChange } from 'src/hooks/useFormValidateOnChange';
import { usePlacementGroupData } from 'src/hooks/usePlacementGroupsData';
import { usePlacementGroupQuery } from 'src/queries/placementGroups';
import { useMutatePlacementGroup } from 'src/queries/placementGroups';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { getAffinityEnforcement } from './utils';

import type { PlacementGroupsEditDrawerProps } from './types';
import type { UpdatePlacementGroupPayload } from '@linode/api-v4';
import type { FormikHelpers } from 'formik';

export const PlacementGroupsEditDrawer = (
  props: PlacementGroupsEditDrawerProps
) => {
  const { onClose, onPlacementGroupEdit, open } = props;
  const { id } = useParams<{ id: string }>();
  const { data: selectedPlacementGroup } = usePlacementGroupQuery(
    +id,
    Boolean(id)
  );
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

  const handleResetForm = () => {
    resetForm();
    setHasFormBeenSubmitted(false);
  };

  const handleDrawerClose = () => {
    onClose();
    handleResetForm();
  };

  const handleFormSubmit = async (
    values: UpdatePlacementGroupPayload,
    { setErrors, setStatus }: FormikHelpers<UpdatePlacementGroupPayload>
  ) => {
    setHasFormBeenSubmitted(false);
    setStatus(undefined);
    setErrors({});

    try {
      const response = await mutateAsync(values);

      enqueueSnackbar(`Placement Group ${values.label} successfully updated`, {
        variant: 'success',
      });

      if (onPlacementGroupEdit) {
        onPlacementGroupEdit(response);
      }
      onClose();
    } catch (errors) {
      setErrors(getFormikErrorsFromAPIErrors(errors));
      scrollErrorIntoView();
    }
  };

  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    values,
  } = useFormik<UpdatePlacementGroupPayload>({
    enableReinitialize: true,
    initialValues: {
      label: selectedPlacementGroup?.label ?? '',
    },
    onSubmit: handleFormSubmit,
    validateOnBlur: false,
    validateOnChange: hasFormBeenSubmitted,
    validationSchema: updatePlacementGroupSchema,
  });

  const generalError = error?.find((e) => !e.field)?.reason;

  if (!selectedPlacementGroup) {
    return null;
  }

  return (
    <Drawer
      title={`Edit Placement Group ${selectedPlacementGroup.label} (${
        AFFINITY_TYPES[selectedPlacementGroup.affinity_type]
      })`}
      onClose={handleDrawerClose}
      open={open}
    >
      {generalError && <Notice text={generalError} variant="error" />}
      <Typography mb={1} mt={4}>
        <strong>Region: </strong>
        {region ? `${region.label} (${region.id})` : 'Unknown'}
      </Typography>
      <Typography mb={4}>
        <strong>Affinity Enforcement: </strong>
        {getAffinityEnforcement(selectedPlacementGroup.is_strict)}
      </Typography>
      <Divider />
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
