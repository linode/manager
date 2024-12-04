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

import {
  CANNOT_CHANGE_PLACEMENT_GROUP_POLICY_MESSAGE,
  PLACEMENT_GROUP_POLICY_FLEXIBLE,
  PLACEMENT_GROUP_POLICY_STRICT,
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
  return (
    <Box sx={{ pt: 2 }}>
      <Notice
        text={CANNOT_CHANGE_PLACEMENT_GROUP_POLICY_MESSAGE}
        variant="warning"
      />
      <FormLabel htmlFor={ariaIdentifier}>Placement Group Policy</FormLabel>
      <RadioGroup
        onChange={(event) => {
          handleChange(event);
          setFieldValue('placement_group_policy', event.target.value);
        }}
        id={ariaIdentifier}
        name="placement_group_policy"
        value={value}
      >
        <FormControlLabel
          label={
            <Typography>
              <strong>Strict.</strong> {PLACEMENT_GROUP_POLICY_STRICT}
            </Typography>
          }
          control={<Radio />}
          disabled={disabledPlacementGroupCreateButton}
          value={'strict'}
        />
        <FormControlLabel
          label={
            <Typography>
              <strong>Flexible.</strong> {PLACEMENT_GROUP_POLICY_FLEXIBLE}
            </Typography>
          }
          control={<Radio />}
          disabled={disabledPlacementGroupCreateButton}
          sx={{ mt: 2 }}
          value={'flexible'}
        />
      </RadioGroup>
    </Box>
  );
};
