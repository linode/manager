import { renamePlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Drawer } from 'src/components/Drawer';
import { useMutatePlacementGroup } from 'src/queries/placementGroups';
import { queryKey as placementGroupQueryKey } from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { PlacementGroupsDrawerContent } from './PlacementGroupDrawerContent';

import type { PlacementGroupsRenameDrawerProps } from './types';
import type {
  CreatePlacementGroupPayload,
  RenamePlacementGroupPayload,
} from '@linode/api-v4';

type PlacementGroupDrawerFormikProps = RenamePlacementGroupPayload &
  CreatePlacementGroupPayload;

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
  const [isFormDirty, setIsFormDirty] = React.useState<boolean>(false);

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
      affinity_type: selectedPlacementGroup?.affinity_type as CreatePlacementGroupPayload['affinity_type'],
      label: selectedPlacementGroup?.label ?? '',
      region: selectedPlacementGroup?.region ?? '',
    },
    onSubmit(values, { setErrors, setStatus, setSubmitting }) {
      setIsFormDirty(false);
      setStatus(undefined);
      setErrors({});
      const payload = { ...values };
      const { label } = payload;

      mutateAsync({ label })
        .then((response) => {
          setSubmitting(false);
          // Invalidate Placement Groups Queries
          queryClient.invalidateQueries([placementGroupQueryKey]);

          // Show snackbar notification
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
    validateOnChange: isFormDirty,
    validationSchema: renamePlacementGroupSchema,
  });

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Rename Placement Group ${selectedPlacementGroup?.label}`}
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
        setIsFormDirty={setIsFormDirty}
      />
    </Drawer>
  );
};
