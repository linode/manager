import * as React from 'react';

import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';

export interface APLProps {
  setAPL: (apl: boolean | undefined) => void;
  setHighAvailability: (ha: boolean | undefined) => void;
}

export const APLCopy = () => (
  <Typography>
    Provide development teams a pre-paved path to build, deploy and secure their
    applications.
    <br />
    <Link to="https://otomi.io">Learn more about APL.</Link>
  </Typography>
);

export const ApplicationPlatform = (props: APLProps) => {
  const { setAPL, setHighAvailability } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAPL(e.target.value === 'yes');
    setHighAvailability(e.target.value === 'yes');
  };

  return (
    <FormControl>
      <FormLabel
        sx={(theme) => ({
          '&&.MuiFormLabel-root.Mui-focused': {
            color: theme.name === 'dark' ? 'white' : theme.color.black,
          },
        })}
      >
        <Box display="flex" flexDirection="row">
          <Typography variant="inherit">
            Application Platform for LKE (APL)
          </Typography>
          <Chip color="primary" label="Public Preview" sx={{ ml: 1 }} />
        </Box>
      </FormLabel>
      <Notice variant="warning">
        <Typography>
          Additional costs will be charged for Object Storage usage, one
          NodeBalancer and a minimum of 10 Volumes
        </Typography>
      </Notice>
      <APLCopy />
      <RadioGroup onChange={(e) => handleChange(e)}>
        <FormControlLabel
          label={
            <Typography>Yes, enable Application platform for LKE.</Typography>
          }
          control={<Radio />}
          name="yes"
          value="yes"
        />
        <FormControlLabel control={<Radio />} label="No" name="no" value="no" />
      </RadioGroup>
    </FormControl>
  );
};
