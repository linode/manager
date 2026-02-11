import {
  Box,
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { useFlags } from 'src/hooks/useFlags';

import {
  CANNOT_CHANGE_PLACEMENT_GROUP_POLICY_MESSAGE,
  PLACEMENT_GROUP_POLICY_FLEXIBLE,
  PLACEMENT_GROUP_POLICY_STRICT,
  PLACEMENT_GROUP_UPDATED_POLICY_FLEXIBLE,
  PLACEMENT_GROUP_UPDATED_POLICY_STRICT,
} from './constants';

import type { PlacementGroup } from '@linode/api-v4';
import type { FormikHelpers } from 'formik';

interface Props {
  disabledPlacementGroupCreateButton: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFieldValue: FormikHelpers<any>['setFieldValue'];
  value: PlacementGroup['placement_group_policy'];
}

const ariaIdentifier = 'placement-group-policy-radio-group';

export const PlacementGroupPolicyRadioGroup = (props: Props) => {
  const {
    disabledPlacementGroupCreateButton,
    handleChange,
    setFieldValue,
    value,
  } = props;

  const flags = useFlags();

  // TODO: Clean up this flag after the Placement Group Policy Update is complete.
  const isPlacementGroupPolicyUpdated =
    flags.placementGroupPolicyUpdate ?? false;

  return (
    <Box sx={{ pt: 2 }}>
      <Notice
        text={CANNOT_CHANGE_PLACEMENT_GROUP_POLICY_MESSAGE}
        variant="warning"
      />
      <FormLabel htmlFor={ariaIdentifier}>Placement Group Policy</FormLabel>
      <RadioGroup
        id={ariaIdentifier}
        name="placement_group_policy"
        onChange={(event) => {
          handleChange(event);
          setFieldValue('placement_group_policy', event.target.value);
        }}
        value={value}
      >
        <FormControlLabel
          control={<Radio />}
          disabled={disabledPlacementGroupCreateButton}
          label={
            <Typography>
              <strong>Strict.</strong>{' '}
              {isPlacementGroupPolicyUpdated
                ? PLACEMENT_GROUP_UPDATED_POLICY_STRICT
                : PLACEMENT_GROUP_POLICY_STRICT}
            </Typography>
          }
          value={'strict'}
        />
        <FormControlLabel
          control={<Radio />}
          disabled={disabledPlacementGroupCreateButton}
          label={
            <Typography>
              <strong>Flexible.</strong>{' '}
              {isPlacementGroupPolicyUpdated
                ? PLACEMENT_GROUP_UPDATED_POLICY_FLEXIBLE
                : PLACEMENT_GROUP_POLICY_FLEXIBLE}
            </Typography>
          }
          sx={{ mt: 2 }}
          value={'flexible'}
        />
      </RadioGroup>
    </Box>
  );
};
