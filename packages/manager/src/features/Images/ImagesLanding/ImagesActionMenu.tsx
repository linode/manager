import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { useImageAndLinodeGrantCheck } from '../utils';

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

  const isImageReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'image',
    id: Number(id.split('/')[1]),
  });

  const isAddLinodeRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const { permissionedLinodes: availableLinodes } =
    useImageAndLinodeGrantCheck();

  const isAvailableLinodesPresent = availableLinodes
    ? availableLinodes.length > 0
    : true;

  const actions: Action[] = React.useMemo(() => {
    const isDisabled = status && status !== 'available';
    const isAvailable = !isDisabled;
    return [
      {
        disabled: isImageReadOnly || isDisabled,
        onClick: () => onEdit?.(image),
        title: 'Edit',
        tooltip: isImageReadOnly
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
              disabled: isImageReadOnly || isDisabled,
              onClick: () => onManageRegions(image),
              title: 'Manage Replicas',
              tooltip: isImageReadOnly
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
        disabled: isAddLinodeRestricted || isDisabled,
        onClick: () => onDeploy?.(id),
        title: 'Deploy to New Linode',
        tooltip: isAddLinodeRestricted
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
        disabled: !isAvailableLinodesPresent || isDisabled,
        onClick: () => onRebuild?.(image),
        title: 'Rebuild an Existing Linode',
        tooltip: !isAvailableLinodesPresent
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
        disabled: isImageReadOnly,
        onClick: () => onDelete?.(image),
        title: isAvailable ? 'Delete' : 'Cancel',
        tooltip: isImageReadOnly
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
