import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

export interface NodeBalancerConfigConfirmationActionsPros {
  isLoading: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const NodeBalancerConfigConfirmationActions = ({
  isLoading,
  onClose,
  onDelete,
}: NodeBalancerConfigConfirmationActionsPros) => (
  <ActionsPanel
    primaryButtonProps={{
      'data-testid': 'confirm-cancel',
      label: 'Delete',
      loading: isLoading,
      onClick: onDelete,
    }}
    secondaryButtonProps={{
      'data-testid': 'cancel-cancel',
      label: 'Cancel',
      onClick: onClose,
    }}
    style={{ padding: 0 }}
  />
);

export default NodeBalancerConfigConfirmationActions;
