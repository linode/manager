import * as React from 'react';

import { Box } from 'src/components/Box';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormLabel } from 'src/components/FormLabel';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';

import { CANNOT_CHANGE_AFFINITY_TYPE_ENFORCEMENT_MESSAGE } from './constants';

import type { FormikHelpers } from 'formik';

interface Props {
  disabledPlacementGroupCreateButton: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFieldValue: FormikHelpers<any>['setFieldValue'];
  value: boolean;
}

export const PlacementGroupsAffinityTypeEnforcementRadioGroup = (
  props: Props
) => {
  const {
    disabledPlacementGroupCreateButton,
    handleChange,
    setFieldValue,
    value,
  } = props;
  return (
    <Box sx={{ pt: 2 }}>
      <Notice
        text={CANNOT_CHANGE_AFFINITY_TYPE_ENFORCEMENT_MESSAGE}
        variant="warning"
      />
      <FormLabel htmlFor="affinity-type-enforcement-radio-group">
        Affinity Type Enforcement
      </FormLabel>
      <RadioGroup
        onChange={(event) => {
          handleChange(event);
          setFieldValue('is_strict', event.target.value === 'true');
        }}
        id="affinity-type-enforcement-radio-group"
        name="is_strict"
        value={value}
      >
        <FormControlLabel
          label={
            <Typography>
              <strong>Strict.</strong> You can’t assign Linodes if the preferred
              container defined by your Affinity Type lacks capacity or is
              unavailable (best practice).
            </Typography>
          }
          control={<Radio />}
          disabled={disabledPlacementGroupCreateButton}
          value={true}
        />
        <FormControlLabel
          label={
            <Typography>
              <strong>Flexible.</strong> You can assign Linodes, even if they’re
              not in the preferred container defined by your Affinity Type, but
              your placement group will be non-compliant.
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
