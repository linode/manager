import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { useLinodesPermissionsCheck } from '../utils';

import type { Event, Image } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface Handlers {
  onCancelFailed?: (imageID: string) => void;
  onDelete?: (image: Image) => void;
  onDeploy?: (imageID: string) => void;
  onEdit?: (image: Image) => void;
  onManageRegions?: (image: Image) => void;
  onRebuild?: (image: Image) => void;
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
    onRebuild,
  } = handlers;

  const { data: imagePermissions } = usePermissions(
    'image',
    ['update_image', 'delete_image', 'replicate_image'],
    id
  );
  const { data: linodePermissions } = usePermissions('account', [
    'create_linode',
    'rebuild_linode',
  ]);

  const { availableLinodes } = useLinodesPermissionsCheck();

  const isAvailableLinodesPresent = availableLinodes
    ? availableLinodes.length > 0
    : true;

  const actions: Action[] = React.useMemo(() => {
    const isDisabled = status && status !== 'available';
    const isAvailable = !isDisabled;
    return [
      {
        disabled: !imagePermissions.update_image || isDisabled,
        onClick: () => onEdit?.(image),
        title: 'Edit',
        tooltip: !imagePermissions.update_image
          ? getRestrictedResourceText({
              action: 'edit',
              isSingular: true,
              resourceType: 'Images',
            })
          : isDisabled
            ? 'Image is not yet available for use.'
            : undefined,
      },
      ...(onManageRegions && image.regions && image.regions.length > 0
        ? [
            {
              disabled: !imagePermissions.replicate_image || isDisabled,
              onClick: () => onManageRegions(image),
              title: 'Manage Replicas',
              tooltip: !imagePermissions.replicate_image
                ? getRestrictedResourceText({
                    action: 'edit',
                    isSingular: true,
                    resourceType: 'Images',
                  })
                : undefined,
            },
          ]
        : []),
      {
        disabled: !linodePermissions.create_linode || isDisabled,
        onClick: () => onDeploy?.(id),
        title: 'Deploy to New Linode',
        tooltip: !linodePermissions.create_linode
          ? getRestrictedResourceText({
              action: 'create',
              isSingular: false,
              resourceType: 'Linodes',
            })
          : isDisabled
            ? 'Image is not yet available for use.'
            : undefined,
      },
      {
        disabled:
          !linodePermissions.rebuild_linode ||
          !isAvailableLinodesPresent ||
          isDisabled,
        onClick: () => onRebuild?.(image),
        title: 'Rebuild an Existing Linode',
        tooltip:
          !linodePermissions.rebuild_linode || !isAvailableLinodesPresent
            ? getRestrictedResourceText({
                action: 'rebuild',
                isSingular: false,
                resourceType: 'Linodes',
              })
            : isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
      },
      {
        disabled: !imagePermissions.delete_image,
        onClick: () => onDelete?.(image),
        title: isAvailable ? 'Delete' : 'Cancel',
        tooltip: !imagePermissions.delete_image
          ? getRestrictedResourceText({
              action: 'delete',
              isSingular: true,
              resourceType: 'Images',
            })
          : undefined,
      },
    ];
  }, [
    status,
    event,
    id,
    label,
    description,
    onCancelFailed,
    onEdit,
    image,
    onManageRegions,
    onDeploy,
    onRebuild,
    onDelete,
  ]);

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Image ${image.label}`}
    />
  );
};
