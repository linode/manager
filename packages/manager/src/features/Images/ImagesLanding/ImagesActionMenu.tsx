import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Event, Image, ImageStatus } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface Handlers {
  onCancelFailed?: (imageID: string) => void;
  onDelete?: (label: string, imageID: string, status?: ImageStatus) => void;
  onDeploy?: (imageID: string) => void;
  onEdit?: (image: Image) => void;
  onManageRegions?: (image: Image) => void;
  onRestore?: (image: Image) => void;
  onRetry?: (
    imageID: string,
    label: string,
    description: null | string
  ) => void;
}

interface Props {
  event?: Event;
  handlers: Handlers;
  image: Image;
}

export const ImagesActionMenu = (props: Props) => {
  const { event, handlers, image } = props;

  const { description, id, label, status } = image;

  const {
    onCancelFailed,
    onDelete,
    onDeploy,
    onEdit,
    onManageRegions,
    onRestore,
    onRetry,
  } = handlers;

  const actions: Action[] = React.useMemo(() => {
    const isDisabled = status && status !== 'available';
    const isAvailable = !isDisabled;
    const isFailed = event?.status === 'failed';
    return isFailed
      ? [
          {
            onClick: () => onRetry?.(id, label, description),
            title: 'Retry',
          },
          {
            onClick: () => onCancelFailed?.(id),
            title: 'Cancel',
          },
        ]
      : [
          {
            disabled: isDisabled,
            onClick: () => onEdit?.(image),
            title: 'Edit',
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
          },
          ...(onManageRegions
            ? [
                {
                  disabled: isDisabled,
                  onClick: () => onManageRegions(image),
                  title: 'Manage Regions',
                },
              ]
            : []),
          {
            disabled: isDisabled,
            onClick: () => onDeploy?.(id),
            title: 'Deploy to New Linode',
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
          },
          {
            disabled: isDisabled,
            onClick: () => onRestore?.(image),
            title: 'Rebuild an Existing Linode',
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
          },
          {
            onClick: () => onDelete?.(label, id, status),
            title: isAvailable ? 'Delete' : 'Cancel',
          },
        ];
  }, [
    status,
    event,
    onRetry,
    id,
    label,
    description,
    onCancelFailed,
    onEdit,
    image,
    onManageRegions,
    onDeploy,
    onRestore,
    onDelete,
  ]);

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Image ${image.label}`}
    />
  );
};
