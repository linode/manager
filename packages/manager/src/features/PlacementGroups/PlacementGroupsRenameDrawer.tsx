import { renamePlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Drawer } from 'src/components/Drawer';
import { useFormValidateOnChange } from 'src/hooks/useFormValidateOnChange';
import { queryKey as placementGroupQueryKey } from 'src/queries/placementGroups';
import { useMutatePlacementGroup } from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { PlacementGroupsDrawerContent } from './PlacementGroupsDrawerContent';

import type {
  PlacementGroupDrawerFormikProps,
  PlacementGroupsRenameDrawerProps,
} from './types';

export const PlacementGroupsRenameDrawer = (
  props: PlacementGroupsRenameDrawerProps
) => {
  const {
    onClose,
    onPlacementGroupRenamed,
    open,
    selectedPlacementGroup,
  } = props;
  const queryClient = useQueryClient();
  const { data: regions } = useRegionsQuery();
  const { mutateAsync } = useMutatePlacementGroup(
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
    setFieldValue,
    status,
    values,
    ...rest
  } = useFormik<PlacementGroupDrawerFormikProps>({
    enableReinitialize: true,
    initialValues: {
      affinity_type: selectedPlacementGroup?.affinity_type as PlacementGroupDrawerFormikProps['affinity_type'],
      label: selectedPlacementGroup?.label ?? '',
      region: selectedPlacementGroup?.region ?? '',
      strict: true,
    },
    onSubmit(values, { setErrors, setStatus, setSubmitting }) {
      setHasFormBeenSubmitted(false);
      setStatus(undefined);
      setErrors({});
      const payload = { ...values };
      // This is a bit of an outlier. We only need to pass the label since that's the only value the API accepts.
      // Meanwhile formik is still keeping track of the other values since we're showing them in the UI.
      const { label } = payload;

      mutateAsync({ label })
        .then((response) => {
          setSubmitting(false);
          queryClient.invalidateQueries([placementGroupQueryKey]);

          enqueueSnackbar(
            `Placement Group ${payload.label} successfully renamed`,
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
            'Error renaming Placement Group.'
          );
        });
    },
    validateOnBlur: false,
    validateOnChange: hasFormBeenSubmitted,
    validationSchema: renamePlacementGroupSchema,
  });

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Rename Placement Group ${selectedPlacementGroup?.label ?? ''}`}
    >
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
        mode="rename"
        onClose={onClose}
        open={open}
        regions={regions ?? []}
        setHasFormBeenSubmitted={setHasFormBeenSubmitted}
      />
    </Drawer>
  );
};
