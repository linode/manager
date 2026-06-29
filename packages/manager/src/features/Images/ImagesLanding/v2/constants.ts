export const DEFAULT_PAGE_SIZES = [25, 50, 75, 100];

// Paths
export const JOINED_GROUP_DETAILS_PATH =
  '/images/share-groups/joined-groups/$tokenUuid';

export const CREATE_SHARE_GROUP_PENDO_IDS = {
  landingHeader: 'Images Share Groups Create-Landing Header',
  label: 'Share Groups Create Images-Label',
  description: 'Share Groups Create Images-Description',
  createButton: 'Share Groups Create Images-Create Button',
};
// Shared Image drawer Pendo IDs
export const VIEW_SHARED_IMAGE_DETAILS_DRAWER_PENDO_IDS = {
  xButton: 'Images Library Shared View-X button',
  closeButton: 'Images Library Shared View-Close',
  copyImageIdIcon: 'Images Library Shared View-Copy ID',
};

export const SHARE_GROUP_DETAILS_PENDO_IDS = {
  landingHeader: 'Images Share Groups Details-Landing Header',
  copyShareGroupUUIDIcon: 'Share Groups Details-Copy UUID',
  editGroupButton: 'Share Groups Details-Edit Group Button',
  editShareGroupButton: 'Share Groups Details-Edit Group Button',
  deleteShareGroupButton: 'Share Groups Details-Delete Group Button',
  imagesSearchField: 'Share Groups Details-Images search field',
  imagesActionButton: 'Share Groups Details-Images Action Button',
  editImagesDetailsButton: 'Share Groups Details-Edit Images Details Button',
  removeFromGroupButton: 'Share Groups Details-Remove From Group Button',
  groupMembersSearchField: 'Share Groups Details-Group Members Search Field',
  inactiveMembersCheckbox: 'Share Groups Details-Active Members Checkbox',
  addMembersButton: 'Share Groups Details-Add Members Button',
  addImagesButton: 'Share Groups Details-Add Images Button',
  copyMembersuuidIcon: 'Share Groups Details-Copy Token UUID',
  revokeAccessButton: 'Share Groups Details-Revoke Access Button',
};

export const DELETE_SHARE_GROUP_PENDO_IDS = {
  cancelButton: 'Share Groups Delete-Cancel Button',
  deleteButton: 'Share Groups Delete-Delete Share Group Button',
  preferencesLink: 'Share Groups Delete-Preferences Link',
  xButton: 'Share Groups Delete-X Button',
};

export const EDIT_SHARE_GROUP_PENDO_IDS = {
  label: 'Share Groups Edit-Label',
  description: 'Share Groups Edit-Description',
  saveButton: 'Share Groups Edit-Save Button',
  cancelButton: 'Share Groups Edit-Cancel Button',
  xButton: 'Share Groups Edit-X Button',
};

export const JOINED_GROUP_DETAILS_PENDO_IDS = {
  landingHeader: 'Images Groups Joined Group Details-Landing Header',
  copyShareGroupUUIDIcon: 'Images Groups Joined Group Details-Copy UUID',
  searchImagesBar: 'Images Groups Joined Group Details-Search',
  metadataSupportedIcon: 'Images Groups Joined Group Details-Cloud-init',
  replicatedRegionPopover: 'Images Groups Joined Group Details-Replicated in',
  sharedImageLabel: 'Images Groups Joined Group Details-Image',
  viewDetails: {
    xButton: 'Images Groups Joined Group Details View-X button',
    copyImageIdIcon: 'Images Groups Joined Group Details View-Copy image ID',
    closeButton: 'Images Groups Joined Group Details View-Close button',
  },
  actionMenu: {
    viewImageDetails: 'Images Groups Joined Group Details-View Details',
    deployNewLinode: 'Images Groups Joined Group Details-Deploy to New Linode',
    rebuildLinode:
      'Images Groups Joined Group Details-Rebuild an Existing Linode',
  },
  leaveGroup: 'Images Groups Joined Group Details-Leave Group',
};

export const ADD_MEMBERS_DRAWER_PENDO_IDS = {
  label: 'Share Groups Add Members-Label',
  token: 'Share Groups Add Members-Token',
  saveButton: 'Share Groups Add Members-Save Button',
  cancelButton: 'Share Groups Add Members-Cancel Button',
  xButton: 'Share Groups Add Members-X Button',
};

export const LEAVE_GROUP_DIALOG_PENDO_IDS = {
  confirmButton: {
    joinedGroupLanding: 'Images Groups Joined Leave Group-Confirm Button',
    joinedGroupDetail: 'Images Groups Joined Detail Leave Group-Confirm Button',
  },
  cancelButton: {
    joinedGroupLanding: 'Images Groups Joined Leave Group-Cancel Button',
    joinedGroupDetail: 'Images Groups Joined Detail Leave Group-Cancel Button',
  },
  xButton: {
    joinedGroupLanding: 'Images Groups Joined Leave Group-X Button',
    joinedGroupDetail: 'Images Groups Joined Detail Leave Group-X Button',
  },
};

export const CANCEL_MEMBERSHIP_REQUEST_DIALOG_PENDO_IDS = {
  cancelButton: 'Images Groups Membership Requests-Cancel Membership Request',
  confirmButton: 'Images Groups Membership Requests-Keep Request',
  xButton: 'Images Groups Membership Requests-X Button',
};

export const CANCEL_MEMBERSHIP_REQUEST_DIALOG_COPY =
  'Are you sure you want to cancel this membership request? The token generated for this request will no longer be valid. To join the share group, you will need to create a new membership request and share the new token with the receiving party.';

export const REVOKE_ACCESS_DIALOG_PENDO_IDS = {
  cancelButton: 'Share Groups Revoke Access-Cancel Button',
  revokeButton: 'Share Groups Revoke Access-Revoke Button',
  xButton: 'Share Groups Revoke Access-X Button',
};

export const REMOVE_IMAGE_DIALOG_PENDO_IDS = {
  cancelButton: 'Share Groups Details Remove Image-Cancel Button',
  removeButton: 'Share Groups Details Remove Image-Remove Button',
  xButton: 'Share Groups Details Remove Image-X Button',
};

export const REQUEST_MEMBERSHIP_DRAWER_INITIAL_COPY =
  'Generate a one-time token and share it with the group owner to join the share group and access shared images.';

export const REQUEST_MEMBERSHIP_DRAWER_FINAL_STEP_COPY = `Copy the token and share it with the group owner to join the share group. You can use the draft email below. 
The token is valid for 30 days (starting ${new Date().toLocaleDateString()}).
You'll get an email when the group owner grants your access.`;

export const REQUEST_MEMBERSHIP_DRAWER_INFO_NOTICE =
  "To keep your data secure, this token will be displayed only once. Store it in a secure manner, and note that it can't be recovered after closing this window.";

export const REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS = {
  xButton: 'Images Groups Membership Requests Drawer-X button',
  shareGroupUuid: 'Images Groups Membership Requests Drawer-Share Group UUID',
  generateToken: 'Images Groups Membership Requests Drawer-Generate Token',
  notificationBanner:
    'Images Groups Membership Requests Drawer-Notification Banner',
  copyToken: 'Images Groups Membership Requests Drawer-Copy Token icon',
  copyTokenButton: 'Images Groups Membership Requests Drawer-Copy Token Button',
  copyDraftEmail:
    'Images Groups Membership Requests Drawer-Copy Draft Email icon',
  copyDraftEmailButton:
    'Images Groups Membership Requests Drawer-Copy Draft Email Button',
  closeButton: 'Images Groups Membership Requests Drawer-Close Button',
};

export const EDIT_IMAGE_DETAILS_PENDO_IDS = {
  label: 'Share Groups Details Edit Image-Label',
  description: 'Share Groups Details Edit Image-Description',
  saveButton: 'Share Groups Details Edit Image-Save Button',
  cancelButton: 'Share Groups Details Edit Image-Cancel Button',
  xButton: 'Share Groups Details Edit Image-X Button',
};

export const ADD_IMAGES_PENDO_IDS = {
  landingHeader: 'Share Groups Add Images-Landing Header',
  searchField: 'Share Groups Add Images-Search Field',
  addImagesButton: 'Share Groups Add Images-Add Images Button',
};
