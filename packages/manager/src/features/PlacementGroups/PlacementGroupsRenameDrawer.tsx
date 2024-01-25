import { AffinityType } from '@linode/api-v4';
import { createPlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Drawer } from 'src/components/Drawer';
import { useCreatePlacementGroup } from 'src/queries/placementGroups';
import { queryKey as placementGroupQueryKey } from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { PlacementGroupsDrawerContent } from './PlacementGroupDrawerContent';
import { MAX_NUMBER_OF_PLACEMENT_GROUPS } from './constants';

import type { PlacementGroupsRenameDrawerProps } from './types';
import type { CreatePlacementGroupPayload } from '@linode/api-v4';

export const PlacementGroupsRenameDrawer = (
  props: PlacementGroupsRenameDrawerProps
) => {
  const {
    numberOfPlacementGroupsCreated,
    onClose,
    onPlacementGroupRenamed,
    open,
    selectedPlacementGroup,
  } = props;
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
    ...rest
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      affinity_type:
        selectedPlacementGroup?.affinity_type ??
        ('' as CreatePlacementGroupPayload['affinity_type']),
      label: '',
      region: selectedPlacementGroup?.region ?? '',
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

          if (onPlacementGroupRenamed) {
            onPlacementGroupRenamed(response);
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

  const affinityTypeOptions: {
    label: string;
    value: string;
  }[] = Object.entries(AffinityType).map(([key, value]) => ({
    label: value,
    value: key as CreatePlacementGroupPayload['affinity_type'],
  }));

  return (
    <Drawer onClose={onClose} open={open} title="Rename Placement Group">
      <PlacementGroupsDrawerContent
        formik={{
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          resetForm,
          setFieldValue,
          status,
          values,
          ...rest,
        }}
        affinityTypeOptions={affinityTypeOptions}
        maxNumberOfPlacementGroups={MAX_NUMBER_OF_PLACEMENT_GROUPS}
        numberOfPlacementGroupsCreated={numberOfPlacementGroupsCreated}
        onClose={onClose}
        open={open}
        regions={regions ?? []}
      />
    </Drawer>
  );
};
