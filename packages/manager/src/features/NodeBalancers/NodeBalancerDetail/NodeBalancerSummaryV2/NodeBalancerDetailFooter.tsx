import { useNodebalancerUpdateMutation } from '@linode/queries';
import { useSnackbar } from 'notistack';
import React from 'react';

import { TagCell } from 'src/components/TagCell/TagCell';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { NodeBalancer } from '@linode/api-v4';

interface Props {
  nodebalancer: NodeBalancer;
}

export const NodeBalancerDetailFooter = ({ nodebalancer }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: updateNodeBalancer } = useNodebalancerUpdateMutation(
    nodebalancer.id
  );
  const { data: accountPermissions } = usePermissions('account', [
    'is_account_admin',
  ]);

  const updateTags = React.useCallback(
    async (tags: string[]) => {
      return updateNodeBalancer({ tags }).catch((e) =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error updating tags')[0].reason,
          {
            variant: 'error',
          }
        )
      );
    },
    [updateNodeBalancer, enqueueSnackbar]
  );

  return (
    <TagCell
      disabled={!accountPermissions?.is_account_admin}
      entity="NodeBalancer"
      sx={{
        width: '100%',
      }}
      tags={nodebalancer.tags}
      updateTags={updateTags}
      view="inline"
    />
  );
};
