import { Event } from '@linode/api-v4/lib/account';
import { ImageStatus } from '@linode/api-v4/lib/images/types';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';

export interface Handlers {
  onCancelFailed?: (imageID: string) => void;
  onDelete?: (label: string, imageID: string, status?: ImageStatus) => void;
  onDeploy?: (imageID: string) => void;
  onEdit?: (label: string, description: string, imageID: string) => void;
  onRestore?: (imageID: string) => void;
  onRetry?: (
    imageID: string,
    label: string,
    description: null | string
  ) => void;
}

interface Props extends Handlers {
  description: null | string;
  event: Event | undefined;
  id: string;
  label: string;
  status?: ImageStatus;
}

export const ImagesActionMenu = (props: Props) => {
  const {
    description,
    event,
    id,
    label,
    onCancelFailed,
    onDelete,
    onDeploy,
    onEdit,
    onRestore,
    onRetry,
    status,
  } = props;

  const actions: Action[] = React.useMemo(() => {
    const isDisabled = status && status !== 'available';
    const isAvailable = !isDisabled;
    const isFailed = event?.status === 'failed';
    return isFailed
      ? [
          {
            onClick: () => {
              onRetry?.(id, label, description);
            },
            title: 'Retry',
          },
          {
            onClick: () => {
              onCancelFailed?.(id);
            },
            title: 'Cancel',
          },
        ]
      : [
          {
            disabled: isDisabled,
            onClick: () => {
              onEdit?.(label, description ?? ' ', id);
            },
            title: 'Edit',
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
          },
          {
            disabled: isDisabled,
            onClick: () => {
              onDeploy?.(id);
            },
            title: 'Deploy to New Linode',
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
          },
          {
            disabled: isDisabled,
            onClick: () => {
              onRestore?.(id);
            },
            title: 'Rebuild an Existing Linode',
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
          },
          {
            onClick: () => {
              onDelete?.(label, id, status);
            },
            title: isAvailable ? 'Delete' : 'Cancel Upload',
          },
        ];
  }, [
    status,
    description,
    id,
    label,
    onDelete,
    onRestore,
    onDeploy,
    onEdit,
    onRetry,
    onCancelFailed,
    event,
  ]);

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Image ${props.label}`}
    />
  );
};
