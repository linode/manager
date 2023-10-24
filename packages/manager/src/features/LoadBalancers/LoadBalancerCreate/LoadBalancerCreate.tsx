import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';

import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';
import { LoadBalancerLabel } from './LoadBalancerLable';
import { LoadBalancerRegions } from './LoadBalancerRegions';

export const StyledAddConfigurationButton = styled(Button, {
  label: 'StyledAddConfigurationButton',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(1),
  },
}));

const LoadBalancerCreate = () => {
  return (
    <Grid className="m0" container spacing={0}>
      <DocumentTitleSegment segment="Create a Load Balancer" />
      <LandingHeader title="Create" />
      <LoadBalancerLabel
        labelFieldProps={{
          disabled: false,
          errorText: '',
          label: 'Linode Label',
          onChange: () => null,
          value: '',
        }}
      />
      <LoadBalancerRegions />
      <LoadBalancerConfiguration />
      {/* TODO: AGLB -
       * Implement Review Load Balancer Action Behavior
       * Implement Cancel Behavior
       * Implement Add Another Configuration Behavior
       */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '16px',
          width: '100%',
        }}
      >
        <div>
          <StyledAddConfigurationButton
            buttonType="outlined"
            data-qa-api-cli-linode
            onClick={() => null}
          >
            Add Another Configuration
          </StyledAddConfigurationButton>
        </div>

        <ActionsPanel
          primaryButtonProps={{
            label: 'Review Load Balancer',
            onClick: () => null,
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: () => null }}
          sx={{ margin: 0, padding: 0 }}
        />
      </div>
    </Grid>
  );
};

export default LoadBalancerCreate;
