import { useNodebalancerDeleteMutation } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import { useMatch, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';

import { getRestrictedResourceText } from '../Account/utils';
import { usePermissions } from '../IAM/hooks/usePermissions';

import type { APIError, NodeBalancer } from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  nodeBalancerError: APIError[] | null;
  open: boolean;
  selectedNodeBalancer: NodeBalancer | undefined;
}

export const NodeBalancerDeleteDialog = ({
  isFetching,
  nodeBalancerError,
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

  const { data: permissions } = usePermissions(
    'nodebalancer',
    ['delete_nodebalancer'],
    selectedNodeBalancer?.id,
    open
  );
  const label = selectedNodeBalancer?.label;

  const onDelete = async () => {
    await mutateAsync();
    navigate({ to: '/nodebalancers' });
  };

  return (
    <TypeToConfirmDialog
      disableTypeToConfirmInput={!permissions?.delete_nodebalancer}
      disableTypeToConfirmSubmit={!permissions?.delete_nodebalancer}
      entity={{
        action: 'deletion',
        name: label,
        primaryBtnText: 'Delete',
        type: 'NodeBalancer',
        error: nodeBalancerError,
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
      title={`Delete${label ? ` ${label}` : ''}?`}
      typographyStyle={{ marginTop: '20px' }}
    >
      {!permissions.delete_nodebalancer && (
        <Notice
          text={getRestrictedResourceText({
            resourceType: 'NodeBalancers',
            action: 'delete',
          })}
          variant="error"
        />
      )}
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
