import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';

import type {
  CreatePlacementGroupPayload,
  PlacementGroup,
} from '@linode/api-v4';
import type { Region } from '@linode/api-v4';
import type { FormikProps } from 'formik';

interface Props {
  affinityTypeOptions: {
    label: string;
    value: string;
  }[];
  formik: FormikProps<CreatePlacementGroupPayload>;
  maxNumberOfPlacementGroups: number;
  numberOfPlacementGroupsCreated: number;
  onClose: () => void;
  open: boolean;
  regions: Region[];
  selectedPlacementGroup?: PlacementGroup;
  selectedRegionId?: string;
}

export const PlacementGroupsDrawerContent = (props: Props) => {
  const {
    affinityTypeOptions,
    formik,
    maxNumberOfPlacementGroups,
    numberOfPlacementGroupsCreated,
    onClose,
    open,
    regions,
    selectedPlacementGroup,
    selectedRegionId,
  } = props;
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
  } = formik;

  React.useEffect(() => {
    if (open) {
      resetForm();
      // setGeneralSubnetErrorsFromAPI([]);
      // setGeneralAPIError(undefined);
    }
  }, [open, resetForm]);

  const generalError = status?.generalError;
  const isRenameDrawer = !Boolean(selectedPlacementGroup);

  return (
    <Grid>
      {generalError ? <Notice text={generalError} variant="error" /> : null}
      <form onSubmit={handleSubmit}>
        <Stack spacing={1}>
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
            disabled={isRenameDrawer || Boolean(selectedRegionId)}
            errorText={errors.region}
            regions={regions ?? []}
            selectedId={selectedRegionId ?? values.region}
          />
          <Autocomplete
            onChange={(_, value) => {
              setFieldValue('affinity_type', value?.value ?? '');
            }}
            value={affinityTypeOptions.find(
              (option) => option.value === values.affinity_type
            )}
            disabled={isRenameDrawer}
            errorText={errors.affinity_type}
            label="Affinity Type"
            options={affinityTypeOptions}
            placeholder="Select an Affinity Type"
          />
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled:
                !isRenameDrawer &&
                numberOfPlacementGroupsCreated >= maxNumberOfPlacementGroups,
              label: `${isRenameDrawer ? 'Rename' : 'Create'} Placement Group`,
              loading: isSubmitting,
              tooltipText:
                'You have reached the maximum amount of Placement Groups.',
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
    </Grid>
  );
};
