import { AFFINITY_TYPES } from '@linode/api-v4';
import { createPlacementGroupSchema } from '@linode/validation';
import Grid from '@mui/material/Unstable_Grid2';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { useFormValidateOnChange } from 'src/hooks/useFormValidateOnChange';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { queryKey as placementGroupQueryKey } from 'src/queries/placementGroups';
import { useAssignLinodesToPlacementGroup } from 'src/queries/placementGroups';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { LinodeSelect } from '../Linodes/LinodeSelect/LinodeSelect';

import type { PlacementGroupsAssignLinodesDrawerProps } from './types';
import type {
  AssignLinodesToPlacementGroupPayload,
  Linode,
} from '@linode/api-v4';
import { Typography } from 'src/components/Typography';
import { Link } from 'src/components/Link';

export const PlacementGroupsAssignLinodesDrawer = (
  props: PlacementGroupsAssignLinodesDrawerProps
) => {
  const {
    onClose,
    onLinodeAddedToPlacementGroup,
    open,
    selectedPlacementGroup,
  } = props;
  const queryClient = useQueryClient();
  const { data: linodes } = useAllLinodesQuery();
  const { mutateAsync } = useAssignLinodesToPlacementGroup(
    selectedPlacementGroup?.id ?? -1
  );
  const { enqueueSnackbar } = useSnackbar();
  const {
    hasFormBeenSubmitted,
    setHasFormBeenSubmitted,
  } = useFormValidateOnChange();
  const [selectedDefaultLinode, setSelectedDefaultLinode] = React.useState<
    Linode | undefined
  >(undefined);

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
      linodes: null as AssignLinodesToPlacementGroupPayload['linodes'] | null,
    },
    onSubmit(
      values: AssignLinodesToPlacementGroupPayload,
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
            `Linode ${payload.linodes[0]} successfully assigned to Placement Group.`,
            {
              variant: 'success',
            }
          );

          if (onLinodeAddedToPlacementGroup) {
            onLinodeAddedToPlacementGroup(response);
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

  const generalError = status?.generalError;

  if (!linodes) {
    return null;
  }

  if (!selectedPlacementGroup) {
    return null;
  }

  const { affinity_type, label } = selectedPlacementGroup;

  const drawerTitle =
    label && affinity_type
      ? `Add Linodes to Placement Group ${label} (${AFFINITY_TYPES[affinity_type]})`
      : 'Add Linodes to Placement Group';

  return (
    <Drawer onClose={onClose} open={open} title={drawerTitle}>
      <Grid>
        {generalError ? <Notice text={generalError} variant="error" /> : null}
        <form onSubmit={handleSubmit}>
          <Stack spacing={1}>
            <Typography>
              A Linode can only be assigned to a single Placement Group.
            </Typography>

            <Typography>
              If you need to add a new Linode, go to{' '}
              <Link to="/linodes/create">Create Linode</Link> and return to this
              page to assign it to this Placement Group.
            </Typography>
            <LinodeSelect
              onSelectionChange={(value) =>
                setSelectedDefaultLinode(value ?? undefined)
              }
              disabled={false}
              options={linodes}
              // errorText={errorMap.defaultLinode}
              value={selectedDefaultLinode?.id ?? null}
            />

            {/* <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                disabled:
                  // TODO VM_Placement: we may want to move this logic to the create button in the landing page
                  // We just need to wait to wait to see how we're going to get the max number of PGs (account/region)
                  !isRenameDrawer &&
                  numberOfPlacementGroupsCreated &&
                  maxNumberOfPlacementGroups
                    ? numberOfPlacementGroupsCreated >=
                      maxNumberOfPlacementGroups
                    : false,
                label: `${
                  isRenameDrawer ? 'Rename' : 'Create'
                } Placement Group`,
                loading: isSubmitting,
                tooltipText: MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE,
                type: 'submit',
              }}
              secondaryButtonProps={{
                'data-testid': 'cancel',
                label: 'Cancel',
                onClick: onClose,
              }}
              sx={{ pt: 4 }}
            /> */}
          </Stack>
        </form>
      </Grid>
    </Drawer>
  );
};
