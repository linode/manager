import { FormLabel } from '@mui/material';
import * as React from 'react';

import { displayPrice } from 'src/components/DisplayPrice';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';

interface HACopyProps {
  isDCSpecificPricing: boolean;
}

export interface HAControlPlaneProps {
  highAvailabilityPrice: number | undefined;
  setHighAvailability: (ha: boolean | undefined) => void;
}

export const HACopy = (props: HACopyProps) => {
  const { isDCSpecificPricing } = props;
  return (
    <Typography>
      Recommended for production workloads, a high availability (HA) control
      plane is replicated on multiple master nodes to 99.99% uptime.
      <br />
      {isDCSpecificPricing
        ? 'Prices may vary based on Region.'
        : undefined}{' '}
      <Link to="https://www.linode.com/docs/guides/enable-lke-high-availability/">
        Learn more about the HA control plane
      </Link>
      .
    </Typography>
  );
};

export const HAControlPlane = (props: HAControlPlaneProps) => {
  const { highAvailabilityPrice, setHighAvailability } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHighAvailability(e.target.value === 'yes');
  };

  const flags = useFlags();

  return (
    <FormControl data-testid="ha-control-plane-form">
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
      <HACopy isDCSpecificPricing={!!flags.dcSpecificPricing} />
      <RadioGroup
        aria-labelledby="ha-radio-buttons-group-label"
        name="ha-radio-buttons-group"
        onChange={(e) => handleChange(e)}
      >
        <FormControlLabel
          label={`Yes, enable HA control plane. ${
            highAvailabilityPrice
              ? `(${displayPrice(highAvailabilityPrice)}/month)`
              : ''
          }`}
          control={<Radio data-testid="ha-radio-button-yes" />}
          name="yes"
          value="yes"
        />
        <FormControlLabel control={<Radio />} label="No" name="no" value="no" />
      </RadioGroup>
    </FormControl>
  );
};
