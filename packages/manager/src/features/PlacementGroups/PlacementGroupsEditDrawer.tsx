import {
  PLACEMENT_GROUP_TYPES,
  PLACEMENT_GROUP_POLICIES,
} from '@linode/api-v4';
import { updatePlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CircleProgress } from 'src/components/CircleProgress';
import { DescriptionList } from 'src/components/DescriptionList/DescriptionList';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { NotFound } from 'src/components/NotFound';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { useFormValidateOnChange } from 'src/hooks/useFormValidateOnChange';
import {
  useMutatePlacementGroup,
  usePlacementGroupQuery,
} from 'src/queries/placementGroups';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import type { PlacementGroupsEditDrawerProps } from './types';
import type { UpdatePlacementGroupPayload } from '@linode/api-v4';
import type { FormikHelpers } from 'formik';

export const PlacementGroupsEditDrawer = (
  props: PlacementGroupsEditDrawerProps
) => {
  const {
    disableEditButton,
    onClose,
    onPlacementGroupEdit,
    open,
    region,
    selectedPlacementGroup: placementGroupFromProps,
  } = props;
  const { id } = useParams<{ id: string }>();
  const {
    data: placementGroupFromParam,
    isFetching,
    status,
  } = usePlacementGroupQuery(
    Number(id),
    open && placementGroupFromProps === undefined
  );

  const placementGroup = React.useMemo(
    () =>
      open ? placementGroupFromProps ?? placementGroupFromParam : undefined,
    [open, placementGroupFromProps, placementGroupFromParam]
  );

  const { error, mutateAsync } = useMutatePlacementGroup(
    placementGroup?.id ?? -1
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

  const handleClose = () => {
    handleResetForm();
    onClose();
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

      enqueueSnackbar(`Placement Group ${values.label} successfully updated.`, {
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
      label: placementGroup?.label ?? '',
    },
    onSubmit: handleFormSubmit,
    validateOnBlur: false,
    validateOnChange: hasFormBeenSubmitted,
    validationSchema: updatePlacementGroupSchema,
  });

  const generalError = error?.find((e) => !e.field)?.reason;

  return (
    <Drawer
      title={
        placementGroup
          ? `Edit Placement Group ${placementGroup.label}`
          : 'Edit Placement Group'
      }
      onClose={handleClose}
      open={open}
    >
      {generalError && <Notice text={generalError} variant="error" />}
      {placementGroup ? (
        <>
          <DescriptionList
            items={[
              {
                description: region
                  ? `${region.label} (${region.id})`
                  : 'Unknown',
                title: 'Region',
              },
              {
                description:
                  PLACEMENT_GROUP_TYPES[placementGroup.placement_group_type],
                title: 'Placement Group Type',
              },
              {
                description:
                  PLACEMENT_GROUP_POLICIES[
                    placementGroup.placement_group_policy
                  ],
                title: 'Placement Group Policy',
              },
            ]}
            sx={{
              my: 2,
            }}
          />
          <Divider />
          <form onSubmit={handleSubmit}>
            <Stack spacing={1}>
              <TextField
                inputProps={{
                  autoFocus: true,
                }}
                aria-label="Label for the Placement Group"
                disabled={!placementGroup || disableEditButton || false}
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
                  disabled: !placementGroup || disableEditButton,
                  label: 'Edit',
                  loading: isSubmitting,
                  type: 'submit',
                }}
                secondaryButtonProps={{
                  'data-testid': 'cancel',
                  label: 'Cancel',
                  onClick: handleClose,
                }}
                sx={{ pt: 4 }}
              />
            </Stack>
          </form>
        </>
      ) : isFetching ? (
        <CircleProgress />
      ) : status === 'error' ? (
        <NotFound />
      ) : null}
    </Drawer>
  );
};
