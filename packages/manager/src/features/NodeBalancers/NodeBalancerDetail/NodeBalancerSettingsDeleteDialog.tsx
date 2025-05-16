import { useNavigate, useParams } from '@tanstack/react-router';
import React from 'react';

import { NodeBalancerDeleteDialog } from '../NodeBalancerDeleteDialog';

export const NodeBalancerSettingsDeleteDialog = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/nodebalancers/$id/settings/delete' });

  return (
    <NodeBalancerDeleteDialog
      id={id}
      onClose={() =>
        navigate({ to: '/nodebalancers/$id/settings', params: { id } })
      }
      onSuccess={() => navigate({ to: '/nodebalancers' })}
    />
  );
};
