import { FormLabel } from '@mui/material';
import * as React from 'react';

import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';

export interface HAControlPlaneProps {
  hasHAPriceError: boolean;
  highAvailabilityPrice?: string;
  selectedRegionId: null | string;
  setHighAvailability: (ha: boolean | undefined) => void;
}

export const HACopy = () => (
  <Typography>
    Recommended for production workloads, a high availability (HA) control plane
    is replicated on multiple master nodes to 99.99% uptime.
    <br />
    <Link to="https://www.linode.com/docs/guides/enable-lke-high-availability/">
      Learn more about the HA control plane
    </Link>
    .
  </Typography>
);

export const HAControlPlane = (props: HAControlPlaneProps) => {
  const {
    hasHAPriceError,
    highAvailabilityPrice,
    selectedRegionId,
    setHighAvailability,
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHighAvailability(e.target.value === 'yes');
  };

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
      <HACopy />
      {hasHAPriceError && (
        <Notice
          dataTestId="ha-price-error-notice"
          spacingBottom={0}
          spacingTop={8}
          variant="error"
        >
          <Typography sx={(theme) => ({ fontFamily: theme.font.bold })}>
            Could not load price for high availability (HA) control plane at
            this time.
          </Typography>
        </Notice>
      )}
      <RadioGroup
        aria-labelledby="ha-radio-buttons-group-label"
        name="ha-radio-buttons-group"
        onChange={(e) => handleChange(e)}
      >
        <FormControlLabel
          label={`Yes, enable HA control plane. ${
            !selectedRegionId
              ? '(Select a region to view price information.)'
              : `($${highAvailabilityPrice}/month)`
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
