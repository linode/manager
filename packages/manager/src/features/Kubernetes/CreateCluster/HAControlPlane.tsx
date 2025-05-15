import { FormControlLabel, Typography } from '@linode/ui';
import {
  Box,
  CircleProgress,
  FormControl,
  Notice,
  Radio,
  RadioGroup,
  TooltipIcon,
} from '@linode/ui';
import { FormLabel } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';

export interface HAControlPlaneProps {
  highAvailabilityPrice: string;
  isAPLEnabled?: boolean;
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
    <Link to="https://techdocs.akamai.com/cloud-computing/docs/high-availability-ha-control-plane-on-lke">
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
    isAPLEnabled,
    isErrorKubernetesTypes,
    isLoadingKubernetesTypes,
    selectedRegionId,
    setHighAvailability,
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHighAvailability(e.target.value === 'yes');
  };

  return (
    <FormControl data-testid="ha-control-plane-form" disabled={isAPLEnabled}>
      <FormLabel
        id="ha-radio-buttons-group-label"
        sx={(theme) => ({
          '&&.MuiFormLabel-root.Mui-focused': {
            color:
              theme.name === 'dark'
                ? theme.tokens.color.Neutrals.White
                : theme.color.black,
          },
        })}
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
        value={isAPLEnabled ? 'yes' : undefined}
      >
        <FormControlLabel
          checked={isAPLEnabled ? true : undefined}
          control={<Radio data-testid="ha-radio-button-yes" />}
          label={
            <Box alignItems="center" display="flex" flexDirection="row">
              <Typography>
                Yes, enable HA control plane.{' '}
                {selectedRegionId
                  ? `For this region, HA control plane costs $${highAvailabilityPrice}/month.`
                  : '(Select a region to view price information.)'}
              </Typography>
              {isAPLEnabled && (
                <TooltipIcon
                  status="help"
                  text={
                    'Enabled by default when Akamai App Platform is enabled.'
                  }
                />
              )}
            </Box>
          }
          name="yes"
          value="yes"
        />

        <FormControlLabel
          checked={isAPLEnabled ? false : undefined}
          control={<Radio data-testid="ha-radio-button-no" />}
          label="No"
          name="no"
          value="no"
        />
      </RadioGroup>
    </FormControl>
  );
};
