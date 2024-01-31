import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';

import { MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE } from './constants';
import { affinityTypeOptions } from './utils';

import type { PlacementGroupDrawerFormikProps } from './types';
import type { PlacementGroup, Region } from '@linode/api-v4';
import type { FormikProps } from 'formik';

interface Props {
  formik: FormikProps<PlacementGroupDrawerFormikProps>;
  maxNumberOfPlacementGroups?: number;
  mode: 'create' | 'rename';
  numberOfPlacementGroupsCreated?: number;
  onClose: () => void;
  open: boolean;
  regions: Region[];
  selectedPlacementGroup?: PlacementGroup;
  selectedRegionId?: string;
  setHasFormBeenSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PlacementGroupsDrawerContent = (props: Props) => {
  const {
    formik,
    maxNumberOfPlacementGroups,
    mode,
    numberOfPlacementGroupsCreated,
    onClose,
    open,
    regions,
    selectedPlacementGroup,
    selectedRegionId,
    setHasFormBeenSubmitted,
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
    resetForm();
    setHasFormBeenSubmitted(false);
  }, [open, resetForm]);

  React.useEffect(() => {
    if (isSubmitting) {
      setHasFormBeenSubmitted(isSubmitting);
    }
  }, [isSubmitting]);

  const generalError = status?.generalError;
  const isRenameDrawer = mode === 'rename';

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
            value={selectedPlacementGroup?.label ?? values.label}
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
            value={
              affinityTypeOptions.find(
                (option) => option.value === values.affinity_type
              ) ?? null
            }
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
                // TODO VM_Placement: we may want to move this logic to the create button in the landing page
                // We just need to wait to wait to see how we're going to get the max number of PGs (account/region)
                !isRenameDrawer &&
                numberOfPlacementGroupsCreated &&
                maxNumberOfPlacementGroups
                  ? numberOfPlacementGroupsCreated >= maxNumberOfPlacementGroups
                  : false,
              label: `${isRenameDrawer ? 'Rename' : 'Create'} Placement Group`,
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
          />
        </Stack>
      </form>
    </Grid>
  );
};
