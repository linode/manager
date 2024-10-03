import * as React from 'react';

import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';

export interface APLProps {
  setAPL: (apl: boolean) => void;
  setHighAvailability: (ha: boolean | undefined) => void;
}

export const APLCopy = () => (
  <Typography>
    Add a pre-paved path to build, deploy, monitor and secure applications.
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
          <Chip color="primary" label="BETA" sx={{ ml: 1 }} />
        </Box>
      </FormLabel>
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
