import { useNavigate, useParams } from '@tanstack/react-router';
import React from 'react';

import { NodeBalancerDeleteDialog } from './NodeBalancerDeleteDialog';

export const NodeBalancerLandingDeleteDialog = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/nodebalancers/$id/delete' });

  return (
    <NodeBalancerDeleteDialog
      id={id}
      onClose={() => navigate({ to: '/nodebalancers' })}
      onSuccess={() => navigate({ to: '/nodebalancers' })}
    />
  );
};
