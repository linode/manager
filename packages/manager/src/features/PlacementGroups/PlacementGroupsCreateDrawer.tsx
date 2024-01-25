import { AffinityType } from '@linode/api-v4';
import { createPlacementGroupSchema } from '@linode/validation';
import Grid from '@mui/material/Unstable_Grid2';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { useCreatePlacementGroup } from 'src/queries/placementGroups';
import { queryKey as placementGroupQueryKey } from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import type { PlacementGroupsCreateDrawerProps } from './types';
import type { CreatePlacementGroupPayload } from '@linode/api-v4';

export const PlacementGroupsCreateDrawer = (
  props: PlacementGroupsCreateDrawerProps
) => {
  const { onClose, onPlacementGroupCreated, open, selectedRegionId } = props;
  const queryClient = useQueryClient();
  const { data: regions } = useRegionsQuery();
  const { mutateAsync } = useCreatePlacementGroup();
  const { enqueueSnackbar } = useSnackbar();

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
      affinity_type: '',
      label: '',
      region: selectedRegionId ?? '',
    },
    onSubmit(
      values: CreatePlacementGroupPayload,
      { setErrors, setStatus, setSubmitting }
    ) {
      setStatus(undefined);
      setErrors({});
      const payload = { ...values };

      mutateAsync(payload)
        .then((response) => {
          setSubmitting(false);
          // Invalidate Placement Groups Queries
          queryClient.invalidateQueries([placementGroupQueryKey]);

          // Show snackbar notification
          enqueueSnackbar(
            `Placement Group ${payload.label} successfully created`,
            {
              variant: 'success',
            }
          );

          if (onPlacementGroupCreated) {
            onPlacementGroupCreated(response);
          }
          onClose();
        })
        .catch((err) => {
          const mapErrorToStatus = () =>
            setStatus({ generalError: getErrorMap([], err).none });

          setSubmitting(false);
          handleFieldErrors(setErrors, err);
          handleGeneralErrors(
            mapErrorToStatus,
            err,
            'Error creating Placement Group.'
          );
        });
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: createPlacementGroupSchema,
  });

  React.useEffect(() => {
    if (open) {
      resetForm();
      // setGeneralSubnetErrorsFromAPI([]);
      // setGeneralAPIError(undefined);
    }
  }, [open, resetForm]);

  const generalError = status?.generalError;

  const affinityTypeOptions: {
    label: string;
    value: string;
  }[] = Object.entries(AffinityType).map(([key, value]) => ({
    label: value,
    value: key as CreatePlacementGroupPayload['affinity_type'],
  }));

  return (
    <Drawer onClose={onClose} open={open} title="Create Placement Group">
      <Grid>
        {generalError ? <Notice text={generalError} variant="error" /> : null}
        <form onSubmit={handleSubmit}>
          <Stack spacing={1}>
            <TextField
              inputProps={{
                autoFocus: true,
              }}
              aria-label="Label for new Placement Group"
              disabled={false}
              errorText={errors.label}
              label="Label"
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
            />
            <RegionSelect
              handleSelection={(selection) => {
                setFieldValue('region', selection);
              }}
              currentCapability="Linodes" // TODO VM_Placement: change to Placement Groups when available
              disabled={Boolean(selectedRegionId)}
              errorText={errors.region}
              regions={regions ?? []}
              selectedId={selectedRegionId ?? values.region}
            />
            <Autocomplete
              onChange={(_, value) => {
                setFieldValue('affinity_type', value?.value ?? '');
              }}
              value={affinityTypeOptions.find(
                (option) => option.value === values.affinity_type
              )}
              errorText={errors.affinity_type}
              label="Affinity Type"
              options={affinityTypeOptions}
              placeholder="Select an Affinity Type"
            />
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                // disabled: userCannotAddVPC,
                label: 'Create Placement Group',
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
      </Grid>
    </Drawer>
  );
};
