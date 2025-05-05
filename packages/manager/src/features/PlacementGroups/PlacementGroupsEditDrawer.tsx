import {
  PLACEMENT_GROUP_POLICIES,
  PLACEMENT_GROUP_TYPES,
} from '@linode/api-v4';
import { useMutatePlacementGroup } from '@linode/queries';
import {
  ActionsPanel,
  Divider,
  Drawer,
  NotFound,
  Notice,
  Stack,
  TextField,
} from '@linode/ui';
import {
  scrollErrorIntoView,
  useFormValidateOnChange,
} from '@linode/utilities';
import { updatePlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DescriptionList } from 'src/components/DescriptionList/DescriptionList';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';

import type { PlacementGroupsEditDrawerProps } from './types';
import type { UpdatePlacementGroupPayload } from '@linode/api-v4';
import type { FormikHelpers } from 'formik';

export const PlacementGroupsEditDrawer = (
  props: PlacementGroupsEditDrawerProps
) => {
  const {
    disableEditButton,
    isFetching,
    onClose,
    onPlacementGroupEdit,
    open,
    region,
    selectedPlacementGroup: placementGroup,
  } = props;

  const { error, mutateAsync } = useMutatePlacementGroup(
    placementGroup?.id ?? -1
  );
  const { enqueueSnackbar } = useSnackbar();
  const { hasFormBeenSubmitted, setHasFormBeenSubmitted } =
    useFormValidateOnChange();

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
      isFetching={isFetching}
      onClose={handleClose}
      open={open}
      title={
        placementGroup
          ? `Edit Placement Group ${placementGroup.label}`
          : 'Edit Placement Group'
      }
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
                aria-label="Label for the Placement Group"
                disabled={!placementGroup || disableEditButton || false}
                errorText={errors.label}
                inputProps={{
                  autoFocus: true,
                }}
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
      ) : status === 'error' ? (
        <NotFound />
      ) : null}
    </Drawer>
  );
};
