import { createPlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useFormValidateOnChange } from 'src/hooks/useFormValidateOnChange';
import { useCreatePlacementGroup } from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { PlacementGroupsAffinityEnforcementRadioGroup } from './PlacementGroupsAffinityEnforcementRadioGroup';
import { PlacementGroupsAffinityTypeSelect } from './PlacementGroupsAffinityTypeSelect';
import { hasRegionReachedPlacementGroupCapacity } from './utils';

import type { PlacementGroupsCreateDrawerProps } from './types';
import type { CreatePlacementGroupPayload, Region } from '@linode/api-v4';
import type { FormikHelpers } from 'formik';

export const PlacementGroupsCreateDrawer = (
  props: PlacementGroupsCreateDrawerProps
) => {
  const {
    allPlacementGroups,
    onClose,
    onPlacementGroupCreate,
    open,
    selectedRegionId,
  } = props;
  const { data: regions } = useRegionsQuery();
  const { error, mutateAsync } = useCreatePlacementGroup();
  const { enqueueSnackbar } = useSnackbar();
  const {
    hasFormBeenSubmitted,
    setHasFormBeenSubmitted,
  } = useFormValidateOnChange();
  const [
    hasRegionReachedPGCapacity,
    setHasRegionReachedPGCapacity,
  ] = React.useState<boolean>(false);

  const selectedRegionFromProps = regions?.find(
    (r) => r.id === selectedRegionId
  );

  const handleRegionSelect = (region: Region['id']) => {
    const selectedRegion = regions?.find((r) => r.id === region);

    setFieldValue('region', region);
    setHasRegionReachedPGCapacity(
      hasRegionReachedPlacementGroupCapacity({
        allPlacementGroups,
        region: selectedRegion,
      })
    );
  };

  const handleResetForm = () => {
    resetForm();
    setHasFormBeenSubmitted(false);
    setHasRegionReachedPGCapacity(false);
  };

  const handleDrawerClose = () => {
    onClose();
    handleResetForm();
  };

  const handleFormSubmit = async (
    values: CreatePlacementGroupPayload,
    {
      setErrors,
      setStatus,
      setSubmitting,
    }: FormikHelpers<CreatePlacementGroupPayload>
  ) => {
    setHasFormBeenSubmitted(false);
    setStatus(undefined);
    setErrors({});
    const payload = { ...values };

    try {
      const response = await mutateAsync(payload);
      setSubmitting(false);

      enqueueSnackbar(`Placement Group ${payload.label} successfully created`, {
        variant: 'success',
      });

      if (onPlacementGroupCreate) {
        onPlacementGroupCreate(response);
      }
      handleResetForm();
      onClose();
    } catch {
      const mapErrorToStatus = () =>
        setStatus({ generalError: getErrorMap([], error).none });

      setSubmitting(false);
      handleFieldErrors(setErrors, error ?? []);
      handleGeneralErrors(
        mapErrorToStatus,
        error ?? [],
        'Error creating Placement Group.'
      );
    }
  };

  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    setFieldValue,
    status,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      affinity_type: 'anti_affinity',
      is_strict: true,
      label: '',
      region: selectedRegionId ?? '',
    },
    onSubmit: handleFormSubmit,
    validateOnBlur: false,
    validateOnChange: hasFormBeenSubmitted,
    validationSchema: createPlacementGroupSchema,
  });

  const generalError = status?.generalError;

  return (
    <Drawer
      onClose={handleDrawerClose}
      open={open}
      title="Create Placement Group"
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={1}>
          {generalError && <Notice text={generalError} variant="error" />}
          {selectedRegionFromProps && (
            <Typography data-testid="selected-region">
              <strong>Region: </strong>
              {`${selectedRegionFromProps.label} (${selectedRegionFromProps.id})`}
            </Typography>
          )}
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
          {!selectedRegionId && (
            <RegionSelect
              errorText={
                hasRegionReachedPGCapacity
                  ? 'This region has reached capacity'
                  : errors.region
              }
              handleSelection={(selection) => {
                handleRegionSelect(selection);
              }}
              currentCapability="Placement Group"
              disabled={Boolean(selectedRegionId)}
              helperText="Only regions supporting Placement Groups are listed."
              regions={regions ?? []}
              selectedId={selectedRegionId ?? values.region}
            />
          )}
          <PlacementGroupsAffinityTypeSelect
            error={errors.affinity_type}
            setFieldValue={setFieldValue}
          />
          <PlacementGroupsAffinityEnforcementRadioGroup
            handleChange={handleChange}
            setFieldValue={setFieldValue}
            value={values.is_strict}
          />
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: isSubmitting || hasRegionReachedPGCapacity,
              label: 'Create Placement Group',
              loading: isSubmitting,
              onClick: () => setHasFormBeenSubmitted(true),
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
