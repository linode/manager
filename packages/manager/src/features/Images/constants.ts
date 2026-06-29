export const AUTOMATIC_IMAGES_PREFERENCE_KEY = 'images-automatic';
export const MANUAL_IMAGES_PREFERENCE_KEY = 'images-manual';
export const SHARED_IMAGES_PREFERENCE_KEY = 'images-shared';

export const MANUAL_IMAGES_ORDER_PREFERENCE_KEY = 'images-manual-order';
export const AUTOMATIC_IMAGES_ORDER_PREFERENCE_KEY = 'images-automatic-order';
export const SHARED_IMAGES_ORDER_PREFERENCE_KEY = 'images-shared-order';

export const MANUAL_IMAGES_DEFAULT_ORDER = 'asc';
export const MANUAL_IMAGES_DEFAULT_ORDER_BY = 'label';

export const AUTOMATIC_IMAGES_DEFAULT_ORDER = 'asc';
export const AUTOMATIC_IMAGES_DEFAULT_ORDER_BY = 'label';

export const SHARED_IMAGES_DEFAULT_ORDER = 'asc';
export const SHARED_IMAGES_DEFAULT_ORDER_BY = 'label';

export const SHARE_GROUP_COLUMN_HEADER_TOOLTIP =
  "Displays the share group for images shared with you; your custom images don't display a group name.";

export const SHARED_IMAGE_ICON_TOOLTIP =
  'Image shared. Use the View Share Groups action menu to view the groups this image is shared with.';

// Pendo IDs for the Images Landing sub-tabs
export const OWNED_BY_ME_IMAGES_TAB_PENDO_IDS = {
  searchImagesBar: 'Images Library Owned-Search',
};

export const SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS = {
  searchImagesBar: 'Images Library Shared-Search',
  imageSharingDocsLink: 'Images Library Shared-Docs',
  encryptedLink: 'Images Library Shared-Encrypted',
  accessBillingInfoLink: 'Images Library Shared-Access Billing',
  metadataSupportedIcon: 'Images Library Shared-Cloud-init',
  replicatedRegionPopover: 'Images Library Shared-Replicated in',
  sharedImageLabel: 'Images Library Shared-Image',
  actionMenu: {
    viewImageDetails: 'Images Library Shared-View Details',
    deployNewLinode: 'Images Library Shared-Deploy to New Linode',
    rebuildLinode: 'Images Library Shared-Rebuild an Existing Linode',
  },
};

export const RECOVERY_IMAGES_TAB_PENDO_IDS = {
  searchImagesBar: 'Images Library Recovery-Search',
  recoverDeletedLinodeDocsLink: 'Images Library Recovery-Docs',
};

export const SHARE_GROUPS_OWNED_TAB_PENDO_IDS = {
  createButton: 'Images Groups Owned-Create Button',
  imageSharingDocsLink: 'Images Groups Owned-Image sharing docs',
  searchShareGroupsBar: 'Images Groups Owned-Search',
};

export const SHARE_GROUPS_JOINED_TAB_PENDO_IDS = {
  imageSharingDocsLink: 'Images Groups Joined-Image sharing docs',
  joinedGroupName: 'Images Groups Joined-Group name',
  leaveGroupButton: 'Images Groups Joined-Leave group',
  searchShareGroupsBar: 'Images Groups Joined-Search',
};

export const SHARE_GROUPS_MEMBERSHIP_REQUESTS_TAB_PENDO_IDS = {
  imageSharingDocsLink: 'Images Groups Membership Requests-Image sharing docs',
  requestMembershipButton:
    'Images Groups Membership Requests-Request membership',
  searchShareGroupsBar: 'Images Groups Membership Requests-Search',
  shareGroupUuid: 'Images Groups Membership Requests-Share Group UUID copy',
  tokenUuid: 'Images Groups Membership Requests-Token UUID copy',
  cancelRequestButton: 'Images Groups Membership Requests-Cancel',
};
