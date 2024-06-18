import { FormLabel } from '@mui/material';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';

export interface HAControlPlaneProps {
  highAvailabilityPrice: string;
  isErrorKubernetesTypes: boolean;
  isLoadingKubernetesTypes: boolean;
  selectedRegionId: string | undefined;
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

export const getRegionPriceLink = (selectedRegionId: string) => {
  if (selectedRegionId === 'id-cgk') {
    return 'https://www.linode.com/pricing/jakarta/#kubernetes';
  } else if (selectedRegionId === 'br-gru') {
    return 'https://www.linode.com/pricing/sao-paulo/#kubernetes';
  }
  return 'https://www.linode.com/pricing/#kubernetes';
};

export const HAControlPlane = (props: HAControlPlaneProps) => {
  const {
    highAvailabilityPrice,
    isErrorKubernetesTypes,
    isLoadingKubernetesTypes,
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
      {isLoadingKubernetesTypes && selectedRegionId ? (
        <CircleProgress size="sm" sx={{ marginTop: 2 }} />
      ) : selectedRegionId && isErrorKubernetesTypes ? (
        <Notice spacingBottom={4} spacingTop={24} variant="error">
          <Typography>
            The cost for HA control plane is not available at this time. Refer
            to <Link to={getRegionPriceLink(selectedRegionId)}>pricing</Link>{' '}
            for information.
          </Typography>
        </Notice>
      ) : null}
      <RadioGroup
        aria-labelledby="ha-radio-buttons-group-label"
        name="ha-radio-buttons-group"
        onChange={(e) => handleChange(e)}
      >
        <FormControlLabel
          label={
            <Typography>
              Yes, enable HA control plane.{' '}
              {selectedRegionId
                ? `For this region, HA control plane costs $${highAvailabilityPrice}/month.`
                : '(Select a region to view price information.)'}
            </Typography>
          }
          control={<Radio data-testid="ha-radio-button-yes" />}
          name="yes"
          value="yes"
        />
        <FormControlLabel control={<Radio />} label="No" name="no" value="no" />
      </RadioGroup>
    </FormControl>
  );
};
