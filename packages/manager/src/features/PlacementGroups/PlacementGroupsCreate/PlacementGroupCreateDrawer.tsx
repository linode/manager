import { createPlacementGroupSchema } from '@linode/validation';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { TextField } from 'src/components/TextField';
import { queryKey as firewallQueryKey } from 'src/queries/firewalls';
import { useCreatePlacementGroup } from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import type {
  CreatePlacementGroupPayload,
  PlacementGroup,
} from '@linode/api-v4';

interface Props {
  onClose: () => void;
  onPlacementGroupCreated?: (placementGroup: PlacementGroup) => void;
  open: boolean;
  selectedRegion?: string;
}

const initialValues: CreatePlacementGroupPayload = {
  affinity_type: 'affinity',
  label: '',
  region: '',
};

export const PlacementGroupsCreateDrawer = (props: Props) => {
  const theme = useTheme();
  const {
    onClose,
    onPlacementGroupCreated,
    open,
    // selectedRegion
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
    // setFieldValue,
    status,
    values,
  } = useFormik({
    initialValues,
    onSubmit(
      values: CreatePlacementGroupPayload,
      { setErrors, setStatus, setSubmitting }
    ) {
      // Clear drawer error state
      setStatus(undefined);
      setErrors({});
      const payload = { ...values };

      // if (payload.label === '') {
      //   payload.label = undefined;
      // }

      mutateAsync(payload)
        .then((response) => {
          setSubmitting(false);
          queryClient.invalidateQueries([firewallQueryKey]);
          enqueueSnackbar(`Firewall ${payload.label} successfully created`, {
            variant: 'success',
          });

          // Invalidate for Linodes
          // if (payload.devices?.linodes) {
          //   payload.devices.linodes.forEach((linodeId) => {
          //     queryClient.invalidateQueries([
          //       linodesQueryKey,
          //       'linode',
          //       linodeId,
          //       'firewalls',
          //     ]);
          //   });
          // }

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
            'Error creating Firewall.'
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

  const generalError =
    status?.generalError ||
    errors.label ||
    errors.affinity_type ||
    errors.region;

  const affinityTypeOptions: {
    label: string;
    value: CreatePlacementGroupPayload['affinity_type'];
  }[] = [
    { label: 'Affinity', value: 'affinity' },
    { label: 'Anti-affinity', value: 'anti_affinity' },
  ];

  return (
    <Drawer onClose={onClose} open={open} title={'Create Placement Group'}>
      <Grid>
        {generalError ? <Notice text={generalError} variant="error" /> : null}
        <form onSubmit={handleSubmit}>
          <TextField
            inputProps={{
              autoFocus: true,
            }}
            aria-label="Label for your new Firewall"
            disabled={false}
            errorText={errors.label}
            label="Label"
            name="label"
            onBlur={handleBlur}
            onChange={handleChange}
            required
            value={values.label}
          />
          <RegionSelect
            currentCapability="Linodes" // TODO VM_Placement: change to Placement Groups when available
            handleSelection={() => null}
            regions={regions ?? []}
            selectedId={values.region}
          />
          <Autocomplete
            value={affinityTypeOptions.find(
              (option) => option.value === values.affinity_type
            )}
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
            style={{ marginTop: theme.spacing(3) }}
          />
        </form>
      </Grid>
    </Drawer>
  );
};
