import { useFormikContext } from 'formik';
import React, { useState } from 'react';

import { Typography } from 'src/components/Typography';

import { EditActionButton, StyledPaper } from '../LoadBalancerSummary.styles';
import { EditLoadBalancerLabelDrawer } from './EditLoadBalancerLabelDrawer';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

export const EditLoadBalancerLabel = () => {
  const { values } = useFormikContext<CreateLoadbalancerPayload>();

  const [showEditLabelDrawer, setShowEditLabelDrawer] = useState(false);

  return (
    <>
      <StyledPaper>
        <EditActionButton
          onClick={() => {
            setShowEditLabelDrawer(!showEditLabelDrawer);
          }}
        >
          Edit
        </EditActionButton>
        <Typography variant="h3">Load Balancer Label</Typography>
        <Typography>{values?.label}</Typography>
      </StyledPaper>
      <EditLoadBalancerLabelDrawer
        onClose={() => setShowEditLabelDrawer(!showEditLabelDrawer)}
        open={showEditLabelDrawer}
      />
    </>
  );
};
