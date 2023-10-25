import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
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
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const smallScreenActionsPanelStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    width: '100%',
  };
  return (
    <Grid className="m0" container spacing={0}>
      <DocumentTitleSegment segment="Create a Load Balancer" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Global Load Balancers',
              position: 1,
            },
          ],
          pathname: location.pathname,
        }}
        title="Create"
      />
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
      <Grid
        sx={(theme) => ({
          justifyContent: 'space-between',
          marginTop: theme.spacing(2),
          width: '100%',
        })}
        container
      >
        <Grid>
          <StyledAddConfigurationButton
            buttonType="outlined"
            data-qa-api-cli-linode
            onClick={() => null}
          >
            Add Another Configuration
          </StyledAddConfigurationButton>
        </Grid>

        <ActionsPanel
          primaryButtonProps={{
            label: 'Review Load Balancer',
            onClick: () => null,
          }}
          sx={{
            margin: 0,
            padding: 0,
            ...(matchesSmDown ? smallScreenActionsPanelStyles : {}),
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: () => null }}
        />
      </Grid>
    </Grid>
  );
};

export default LoadBalancerCreate;
