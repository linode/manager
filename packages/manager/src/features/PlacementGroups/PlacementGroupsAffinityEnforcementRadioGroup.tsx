import * as React from 'react';

import { Box } from 'src/components/Box';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormLabel } from 'src/components/FormLabel';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';

import type { FormikHelpers } from 'formik';

interface Props {
  disabledPlacementGroupCreateButton: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFieldValue: FormikHelpers<any>['setFieldValue'];
  value: boolean;
}

export const PlacementGroupsAffinityEnforcementRadioGroup = (props: Props) => {
  const {
    disabledPlacementGroupCreateButton,
    handleChange,
    setFieldValue,
    value,
  } = props;
  return (
    <Box sx={{ pt: 2 }}>
      <Notice
        text="Once you create a placement group, you cannot change its Affinity Enforcement setting."
        variant="warning"
      />
      <FormLabel htmlFor="affinity-enforcement-radio-group">
        Affinity Enforcement
      </FormLabel>
      <RadioGroup
        onChange={(event) => {
          handleChange(event);
          setFieldValue('is_strict', event.target.value === 'true');
        }}
        id="affinity-enforcement-radio-group"
        name="is_strict"
        value={value}
      >
        <FormControlLabel
          label={
            <Typography>
              <strong>Strict.</strong> You cannot assign a Linode to your
              placement group if it will violate the policy of your selected
              Affinity Type (best practice).
            </Typography>
          }
          control={<Radio />}
          disabled={disabledPlacementGroupCreateButton}
          value={true}
        />
        <FormControlLabel
          label={
            <Typography>
              <strong>Flexible.</strong> You can assign a Linode to your
              placement group, even if it violates the policy of your selected
              Affinity Type.
            </Typography>
          }
          control={<Radio />}
          disabled={disabledPlacementGroupCreateButton}
          sx={{ mt: 2 }}
          value={false}
        />
      </RadioGroup>
    </Box>
  );
};
