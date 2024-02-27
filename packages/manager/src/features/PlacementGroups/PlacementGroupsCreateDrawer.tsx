import { createPlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormLabel } from 'src/components/FormLabel';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
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

import { affinityTypeOptions } from './utils';

import type { PlacementGroupsCreateDrawerProps } from './types';
import type { CreatePlacementGroupPayload } from '@linode/api-v4';

export const PlacementGroupsCreateDrawer = (
  props: PlacementGroupsCreateDrawerProps
) => {
  const { onClose, onPlacementGroupCreate, open, selectedRegionId } = props;
  const { data: regions } = useRegionsQuery();
  const { error, mutateAsync } = useCreatePlacementGroup();
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
    setFieldValue,
    status,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      affinity_type: '' as CreatePlacementGroupPayload['affinity_type'],
      is_strict: true,
      label: '',
      region: selectedRegionId ?? '',
    },
    async onSubmit(
      values: CreatePlacementGroupPayload,
      { setErrors, setStatus, setSubmitting }
    ) {
      setHasFormBeenSubmitted(false);
      setStatus(undefined);
      setErrors({});
      const payload = { ...values };

      try {
        const response = await mutateAsync(payload);
        setSubmitting(false);

        enqueueSnackbar(
          `Placement Group ${payload.label} successfully created`,
          {
            variant: 'success',
          }
        );

        if (onPlacementGroupCreate) {
          onPlacementGroupCreate(response);
        }
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
    },
    validateOnBlur: false,
    validateOnChange: hasFormBeenSubmitted,
    validationSchema: createPlacementGroupSchema,
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
    <Drawer onClose={onClose} open={open} title="Create Placement Group">
      <form onSubmit={handleSubmit}>
        <Stack spacing={1}>
          {generalError && <Notice text={generalError} variant="error" />}
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
            value={
              affinityTypeOptions.find(
                (option) => option.value === values.affinity_type
              ) ?? null
            }
            errorText={errors.affinity_type}
            label="Affinity Type"
            options={affinityTypeOptions}
            placeholder="Select an Affinity Type"
          />
          <Box sx={{ pt: 2 }}>
            <Notice
              text="Once you create a placement group, you cannot change its Affinity Enforcement setting."
              variant="warning"
            />
            <FormLabel htmlFor="affinity-enforcement-radio-group">
              Affinity Enforcement
            </FormLabel>
            {errors.is_strict !== undefined && (
              <Notice variant="error">
                <Typography>{errors.is_strict}</Typography>
              </Notice>
            )}
            <RadioGroup
              onChange={(event) => {
                handleChange(event);
                setFieldValue('is_strict', event.target.value === 'true');
              }}
              id="affinity-enforcement-radio-group"
              name="is_strict"
              value={values.is_strict}
            >
              <FormControlLabel
                label={
                  <Typography>
                    <strong>Strict.</strong> You cannot assign a Linode to your
                    placement group if it will violate the policy of your
                    selected Affinity Type (best practice).
                  </Typography>
                }
                control={<Radio />}
                value={true}
              />
              <FormControlLabel
                label={
                  <Typography>
                    <strong>Flexible.</strong> Flexible. You can assign a Linode
                    to your placement group, even if it violates the policy of
                    your selected Affinity Type.
                  </Typography>
                }
                control={<Radio />}
                sx={{ mt: 2 }}
                value={false}
              />
            </RadioGroup>
          </Box>
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
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
    </Drawer>
  );
};
