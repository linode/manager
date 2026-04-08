import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS } from '../constants';
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
  isSharedImageRow?: boolean;
  pendoIDs?: typeof SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS;
}

export const ImagesActionMenu = (props: Props) => {
  const { handlers, image, isSharedImageRow, pendoIDs } = props;

  const { id, status } = image;

  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const { onDelete, onDeploy, onEdit, onManageRegions, onRebuild } = handlers;

  const { data: imagePermissions, isLoading: isImagePermissionsLoading } =
    usePermissions(
      'image',
      ['update_image', 'delete_image', 'replicate_image'],
      id,
      isOpen
    );
  const { data: linodeAccountPermissions } = usePermissions('account', [
    'create_linode',
  ]);

  const actions: Action[] = React.useMemo(() => {
    const isDisabled = status && status !== 'available';
    const isAvailable = !isDisabled;

    const deployAction = {
      disabled: !linodeAccountPermissions.create_linode || isDisabled,
      onClick: () => onDeploy?.(id),
      pendoId: isSharedImageRow
        ? pendoIDs?.actionMenu.deployNewLinode
        : undefined,
      title: 'Deploy to New Linode',
      tooltip: !linodeAccountPermissions.create_linode
        ? getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Linodes',
          })
        : isDisabled
          ? 'Image is not yet available for use.'
          : undefined,
    };

    const rebuildAction = {
      disabled: isDisabled,
      onClick: () => onRebuild?.(image),
      pendoId: isSharedImageRow
        ? pendoIDs?.actionMenu.rebuildLinode
        : undefined,
      title: 'Rebuild an Existing Linode',
      tooltip: isDisabled ? 'Image is not yet available for use.' : undefined,
    };

    if (isSharedImageRow) {
      return [
        {
          title: 'View Image Details',
          onClick: () => null,
          pendoId: pendoIDs?.actionMenu.viewImageDetails,
        },
        { ...deployAction },
        { ...rebuildAction },
      ];
    }

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
      { ...deployAction },
      { ...rebuildAction },
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
    id,
    onEdit,
    image,
    onManageRegions,
    onDeploy,
    onRebuild,
    onDelete,
    imagePermissions,
    linodeAccountPermissions,
    pendoIDs,
    isSharedImageRow,
  ]);

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Image ${image.label}`}
      loading={isImagePermissionsLoading}
      onOpen={() => {
        setIsOpen(true);
      }}
    />
  );
};
