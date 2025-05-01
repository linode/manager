import { useNodebalancerDeleteMutation } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import { useMatch, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';

import type { NodeBalancer } from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  open: boolean;
  selectedNodeBalancer: NodeBalancer | undefined;
}

export const NodeBalancerDeleteDialog = ({
  isFetching,
  open,
  selectedNodeBalancer,
}: Props) => {
  const navigate = useNavigate();
  const match = useMatch({
    strict: false,
  });
  const { error, isPending, mutateAsync } = useNodebalancerDeleteMutation(
    selectedNodeBalancer?.id ?? -1
  );

  const label = selectedNodeBalancer?.label;

  const onDelete = async () => {
    await mutateAsync();
    navigate({ to: '/nodebalancers' });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: label,
        primaryBtnText: 'Delete',
        type: 'NodeBalancer',
      }}
      errors={error ?? undefined}
      expand
      label={'NodeBalancer Label'}
      loading={isPending || isFetching}
      onClick={onDelete}
      onClose={
        match.routeId === '/nodebalancers/$id/settings/delete'
          ? () =>
              navigate({
                params: { id: String(selectedNodeBalancer?.id) },
                to: '/nodebalancers/$id/settings',
              })
          : () => navigate({ to: '/nodebalancers' })
      }
      open={open}
      title={`Delete ${label}?`}
      typographyStyle={{ marginTop: '20px' }}
    >
      <Notice variant="warning">
        <Typography style={{ fontSize: '0.875rem' }}>
          Deleting this NodeBalancer is permanent and can’t be undone.
        </Typography>
      </Notice>
      <Typography variant="body1">
        Traffic will no longer be routed through this NodeBalancer. Please check
        your DNS settings and either provide the IP address of another active
        NodeBalancer, or route traffic directly to your Linode.
      </Typography>
    </TypeToConfirmDialog>
  );
};
