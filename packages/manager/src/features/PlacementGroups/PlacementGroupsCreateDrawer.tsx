import { createPlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Drawer } from 'src/components/Drawer';
import { useFormValidateOnChange } from 'src/hooks/useFormValidateOnChange';
import { queryKey as placementGroupQueryKey } from 'src/queries/placementGroups';
import { useCreatePlacementGroup } from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { PlacementGroupsDrawerContent } from './PlacementGroupsDrawerContent';
import { MAX_NUMBER_OF_PLACEMENT_GROUPS } from './constants';

import type {
  PlacementGroupDrawerFormikProps,
  PlacementGroupsCreateDrawerProps,
} from './types';

export const PlacementGroupsCreateDrawer = (
  props: PlacementGroupsCreateDrawerProps
) => {
  const {
    numberOfPlacementGroupsCreated,
    onClose,
    onPlacementGroupCreated,
    open,
    selectedRegionId,
  } = props;
  const queryClient = useQueryClient();
  const { data: regions } = useRegionsQuery();
  const { mutateAsync } = useCreatePlacementGroup();
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
    ...rest
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      affinity_type: '' as PlacementGroupDrawerFormikProps['affinity_type'],
      label: '',
      region: selectedRegionId ?? '',
      strict: true,
    },
    onSubmit(
      values: PlacementGroupDrawerFormikProps,
      { setErrors, setStatus, setSubmitting }
    ) {
      setHasFormBeenSubmitted(false);
      setStatus(undefined);
      setErrors({});
      const payload = { ...values };

      mutateAsync(payload)
        .then((response) => {
          setSubmitting(false);
          queryClient.invalidateQueries([placementGroupQueryKey]);

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
    validateOnChange: hasFormBeenSubmitted,
    validationSchema: createPlacementGroupSchema,
  });

  return (
    <Drawer onClose={onClose} open={open} title="Create Placement Group">
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
        maxNumberOfPlacementGroups={MAX_NUMBER_OF_PLACEMENT_GROUPS}
        mode="create"
        numberOfPlacementGroupsCreated={numberOfPlacementGroupsCreated}
        onClose={onClose}
        open={open}
        regions={regions ?? []}
        selectedRegionId={selectedRegionId}
        setHasFormBeenSubmitted={setHasFormBeenSubmitted}
      />
    </Drawer>
  );
};
