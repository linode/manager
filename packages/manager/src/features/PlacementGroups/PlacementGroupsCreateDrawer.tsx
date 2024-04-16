import { createPlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DescriptionList } from 'src/components/DescriptionList/DescriptionList';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useFormValidateOnChange } from 'src/hooks/useFormValidateOnChange';
import {
  useAllPlacementGroupsQuery,
  useCreatePlacementGroup,
} from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

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
    disabledPlacementGroupCreateButton,
    onClose,
    onPlacementGroupCreate,
    open,
    selectedRegionId,
  } = props;
  const { data: regions } = useRegionsQuery();
  const { data: allPlacementGroups } = useAllPlacementGroupsQuery();
  const { error, mutateAsync } = useCreatePlacementGroup();
  const { enqueueSnackbar } = useSnackbar();
  const {
    hasFormBeenSubmitted,
    setHasFormBeenSubmitted,
  } = useFormValidateOnChange();

  const location = useLocation();
  const displayRegionHeaderText = location.pathname.includes('/linodes/create');

  const handleRegionSelect = (region: Region['id']) => {
    setFieldValue('region', region);
  };

  const handleResetForm = () => {
    resetForm();
    setHasFormBeenSubmitted(false);
  };

  const handleDrawerClose = () => {
    onClose();
    handleResetForm();
  };

  const handleFormSubmit = async (
    values: CreatePlacementGroupPayload,
    { setErrors, setStatus }: FormikHelpers<CreatePlacementGroupPayload>
  ) => {
    setHasFormBeenSubmitted(false);
    setStatus(undefined);
    setErrors({});

    try {
      const response = await mutateAsync(values);

      enqueueSnackbar(`Placement Group ${values.label} successfully created`, {
        variant: 'success',
      });

      if (onPlacementGroupCreate) {
        onPlacementGroupCreate(response);
      }
      handleResetForm();
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
    setFieldValue,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      affinity_type: 'anti_affinity:local',
      is_strict: true,
      label: '',
      region: selectedRegionId ?? '',
    },
    onSubmit: handleFormSubmit,
    validateOnBlur: false,
    validateOnChange: hasFormBeenSubmitted,
    validationSchema: createPlacementGroupSchema,
  });

  const generalError = error?.find((e) => !e.field)?.reason;

  const selectedRegion = React.useMemo(
    () => regions?.find((region) => region.id == values.region),
    [regions, values.region]
  );

  const pgRegionLimitHelperText = `The maximum number of placement groups in this region is: ${selectedRegion?.placement_group_limits?.maximum_pgs_per_customer}`;

  return (
    <Drawer
      onClose={handleDrawerClose}
      open={open}
      title="Create Placement Group"
    >
      {disabledPlacementGroupCreateButton && (
        <Notice
          text={getRestrictedResourceText({
            action: 'edit',
            resourceType: 'Placement Groups',
          })}
          spacingTop={16}
          variant="error"
        />
      )}
      <form onSubmit={handleSubmit}>
        <Stack spacing={1}>
          {generalError && <Notice text={generalError} variant="error" />}
          {selectedRegion && displayRegionHeaderText && (
            <DescriptionList
              items={[
                {
                  description: `${selectedRegion.label} (${selectedRegion.id})`,
                  title: 'Region',
                },
              ]}
              sx={{ my: 2 }}
            />
          )}
          <Divider hidden={!selectedRegionId} />
          <TextField
            inputProps={{
              autoFocus: true,
            }}
            aria-label="Label for the Placement Group"
            disabled={disabledPlacementGroupCreateButton || false}
            errorText={errors.label}
            label="Label"
            name="label"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.label}
          />
          {!selectedRegionId && (
            <RegionSelect
              disabled={
                Boolean(selectedRegionId) || disabledPlacementGroupCreateButton
              }
              handleDisabledRegion={(region) => {
                const isRegionAtCapacity = hasRegionReachedPlacementGroupCapacity(
                  {
                    allPlacementGroups,
                    region,
                  }
                );

                return {
                  disabled: isRegionAtCapacity,
                  reason: (
                    <>
                      <Typography>
                        You’ve reached the limit of placement groups you can
                        create in this region.
                      </Typography>
                      <Typography mt={2}>
                        The maximum number of placement groups in this region
                        is:{' '}
                        {region.placement_group_limits.maximum_pgs_per_customer}
                      </Typography>
                    </>
                  ),
                  tooltipWidth: 300,
                };
              }}
              handleSelection={(selection) => {
                handleRegionSelect(selection);
              }}
              currentCapability="Placement Group"
              helperText={values.region && pgRegionLimitHelperText}
              regions={regions ?? []}
              selectedId={selectedRegionId ?? values.region}
              tooltipText="Only regions supporting Placement Groups are listed."
            />
          )}
          <PlacementGroupsAffinityTypeSelect
            disabledPlacementGroupCreateButton={
              disabledPlacementGroupCreateButton
            }
            error={errors.affinity_type}
            setFieldValue={setFieldValue}
          />
          <PlacementGroupsAffinityEnforcementRadioGroup
            disabledPlacementGroupCreateButton={
              disabledPlacementGroupCreateButton
            }
            handleChange={handleChange}
            setFieldValue={setFieldValue}
            value={values.is_strict}
          />
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled:
                isSubmitting ||
                !values.region ||
                !values.label ||
                disabledPlacementGroupCreateButton,
              label: 'Create Placement Group',
              loading: isSubmitting,
              onClick: () => setHasFormBeenSubmitted(true),
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: handleDrawerClose,
            }}
            sx={{ pt: 4 }}
          />
        </Stack>
      </form>
    </Drawer>
  );
};
