import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import {
  OWNED_BY_ME_IMAGES_TAB_PENDO_IDS,
  SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS,
} from '../constants';
import { JOINED_GROUP_DETAILS_PENDO_IDS } from './v2/constants';

import type { Event, Image } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface Handlers {
  onCancelFailed?: (imageID: string) => void;
  onDelete?: (image: Image) => void;
  onDeploy?: (imageID: string) => void;
  onEdit?: (image: Image) => void;
  onManageRegions?: (image: Image) => void;
  onRebuild?: (image: Image) => void;
  onView?: (image: Image) => void;
  onViewShareGroups?: (image: Image) => void;
}
interface Props {
  event?: Event;
  handlers: Handlers;
  image: Image;
  isSharedImageRow?: boolean;
  pendoIDs?:
    | typeof JOINED_GROUP_DETAILS_PENDO_IDS
    | typeof OWNED_BY_ME_IMAGES_TAB_PENDO_IDS
    | typeof SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS;
}

export const ImagesActionMenu = (props: Props) => {
  const { handlers, image, isSharedImageRow, pendoIDs } = props;

  const { id, status, image_sharing } = image;

  const shareGroupCount = image_sharing?.shared_with?.sharegroup_count ?? 0;
  const isSharedImage = shareGroupCount > 0;

  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const {
    onDelete,
    onDeploy,
    onEdit,
    onManageRegions,
    onRebuild,
    onView,
    onViewShareGroups,
  } = handlers;

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
      pendoId: pendoIDs?.actionMenu.deployNewLinode,
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
      pendoId: pendoIDs?.actionMenu.rebuildLinode,
      title: 'Rebuild an Existing Linode',
      tooltip: isDisabled ? 'Image is not yet available for use.' : undefined,
    };

    if (isSharedImageRow) {
      return [
        {
          title: 'View Image Details',
          onClick: () => onView?.(image),
          pendoId:
            pendoIDs === JOINED_GROUP_DETAILS_PENDO_IDS ||
            pendoIDs === SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS
              ? pendoIDs?.actionMenu.viewImageDetails
              : undefined,
        },
        { ...deployAction },
        { ...rebuildAction },
      ];
    }

    return [
      {
        disabled: !imagePermissions.update_image || isDisabled,
        onClick: () => onEdit?.(image),
        pendoId:
          pendoIDs === OWNED_BY_ME_IMAGES_TAB_PENDO_IDS
            ? pendoIDs?.actionMenu.editImageDetails
            : undefined,
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
      ...(isSharedImage
        ? [
            {
              onClick: () => onViewShareGroups?.(image),
              pendoId:
                pendoIDs === OWNED_BY_ME_IMAGES_TAB_PENDO_IDS
                  ? pendoIDs?.actionMenu.viewImageShareGroups
                  : undefined,
              title: `View Image Share Groups`,
            },
          ]
        : []),
      ...(onManageRegions && image.regions && image.regions.length > 0
        ? [
            {
              disabled: !imagePermissions.replicate_image || isDisabled,
              onClick: () => onManageRegions(image),
              pendoId:
                pendoIDs === OWNED_BY_ME_IMAGES_TAB_PENDO_IDS
                  ? pendoIDs?.actionMenu.manageReplicas
                  : undefined,
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
        disabled: !imagePermissions.delete_image || isSharedImage,
        onClick: () => onDelete?.(image),
        pendoId:
          pendoIDs === OWNED_BY_ME_IMAGES_TAB_PENDO_IDS
            ? pendoIDs?.actionMenu.deleteImage
            : undefined,
        title: isAvailable ? 'Delete' : 'Cancel',
        tooltip: !imagePermissions.delete_image
          ? getRestrictedResourceText({
              action: 'delete',
              isSingular: true,
              resourceType: 'Images',
            })
          : isSharedImage
            ? 'Before deleting an image, remove it from all share groups first.'
            : undefined,
      },
    ];
  }, [
    status,
    id,
    onEdit,
    image,
    onManageRegions,
    onView,
    onViewShareGroups,
    onDeploy,
    onRebuild,
    onDelete,
    imagePermissions,
    linodeAccountPermissions,
    pendoIDs,
    isSharedImageRow,
    isSharedImage,
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
