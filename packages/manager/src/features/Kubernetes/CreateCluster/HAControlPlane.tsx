import { FormLabel } from '@mui/material';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { displayPrice } from 'src/components/DisplayPrice';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';
import { HIGH_AVAILABILITY_PRICE } from 'src/constants';

export const HACopy = () => (
  <Typography>
    Recommended for prodcution workloads, a high availability (HA) control plane
    is replicated on multiple master nodes to 99.99% uptime.
    <br />
    <Link to="https://www.linode.com/docs/guides/enable-lke-high-availability/">
      Learn more about the HA control plane
    </Link>
    .
  </Typography>
);

export interface Props {
  highAvailability?: boolean;
  setHighAvailability: (ha: boolean | undefined) => void;
}

export const HAControlPlane = (props: Props) => {
  const { setHighAvailability } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHighAvailability(e.target.value === 'yes');
  };

  if (HIGH_AVAILABILITY_PRICE === undefined) {
    return null;
  }

  return (
    <Box>
      <FormControl data-testid="ha-control-plane">
        <FormLabel
          sx={(theme) => ({
            '&&.MuiFormLabel-root.Mui-focused': {
              color: theme.name === 'dark' ? 'white' : theme.color.black,
            },
          })}
          id="ha-radio-buttons-group-label"
        >
          <Typography variant="inherit">HA Control Plane</Typography>
        </FormLabel>
        <HACopy />
        <RadioGroup
          aria-labelledby="ha-radio-buttons-group-label"
          name="ha-radio-buttons-group"
          onChange={(e) => handleChange(e)}
        >
          <FormControlLabel
            label={`Yes, enable HA control plane. (${displayPrice(
              HIGH_AVAILABILITY_PRICE
            )}/month)`}
            control={<Radio data-testid="ha-radio-button-yes" />}
            name="yes"
            value="yes"
          />
          <FormControlLabel
            control={<Radio />}
            label="No"
            name="no"
            value="no"
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};
