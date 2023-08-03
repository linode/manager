/* eslint-disable no-console */
import { FormLabel } from '@mui/material';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { displayPrice } from 'src/components/DisplayPrice';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Radio } from 'src/components/Radio/Radio';
import { Typography } from 'src/components/Typography';
import FormControl from 'src/components/core/FormControl';
import RadioGroup from 'src/components/core/RadioGroup';
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
  highAvailability: boolean;
  setHAControlPlaneSelection: (haControlPlane: boolean) => void;
  setHighAvailability: (ha: boolean) => void;
}

export const HAControlPlane = (props: Props) => {
  const {
    highAvailability,
    setHAControlPlaneSelection,
    setHighAvailability,
  } = props;

  if (HIGH_AVAILABILITY_PRICE === undefined) {
    return null;
  }

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const handleChange = () => {
    setHighAvailability(!highAvailability);
    setHAControlPlaneSelection(true);
  };

  return (
    <Box>
      <FormControl data-testid="ha-control-plane">
        <FormLabel id="ha-radio-buttons-group-label">
          <Typography variant="inherit">HA Control Plane</Typography>
        </FormLabel>
        <HACopy />
        <RadioGroup
          aria-labelledby="ha-radio-buttons-group-label"
          name="ha-radio-buttons-group"
          // onChange={(e) => handleChange(e)}
          onChange={handleChange}
        >
          <FormControlLabel
            label={`Yes, enable HA control plane. (${displayPrice(
              HIGH_AVAILABILITY_PRICE
            )}/month)`}
            control={<Radio data-testid="ha-radio-button-yes" />}
            value="yes"
          />
          <FormControlLabel control={<Radio />} label="No" value="no" />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};
