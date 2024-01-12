import React, { useState } from 'react';

import { LoadBalancerRegions } from '../../LoadBalancerRegions';
import { EditActionButton, StyledPaper } from '../LoadBalancerSummary.styles';
import { EditLoadBalancerRegionsDrawer } from './EditLoadBalancerRegionsDrawer';

export const EditLoadBalancerRegions = () => {
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <>
      <StyledPaper sx={{ paddingX: 0 }}>
        <EditActionButton
          onClick={() => {
            setShowDrawer(!showDrawer);
          }}
        >
          Edit
        </EditActionButton>
        <LoadBalancerRegions sx={{ paddingTop: 0 }} />
      </StyledPaper>
      <EditLoadBalancerRegionsDrawer
        onClose={() => setShowDrawer(!showDrawer)}
        open={showDrawer}
      />
    </>
  );
};
