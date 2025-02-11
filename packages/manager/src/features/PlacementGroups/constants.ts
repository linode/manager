// Labels
export const PLACEMENT_GROUP_LABEL = 'Placement Groups';

export const MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE =
  "You've reached the maximum number of Linodes in a Placement Group. Please remove a Linode from this Placement Group before assigning another.";

export const PLACEMENT_GROUP_LINODES_ERROR_MESSAGE =
  'There was an error loading Linodes for this Placement Group.';

export const PLACEMENT_GROUP_TOOLTIP_TEXT = `The Placement Group Type and Region you selected determine the maximum number of Linodes per placement group.`;

export const PLACEMENT_GROUP_SELECT_TOOLTIP_COPY = `
Add your Linode to a group to best meet your needs. 
You may want to group Linodes closer together to help improve performance, or further apart to enable high-availability configurations.`;

export const PLACEMENT_GROUP_HAS_NO_CAPACITY =
  'This placement group has reached the maximum Linode capacity.';

export const MAXIMUM_NUMBER_OF_PLACEMENT_GROUPS_IN_REGION =
  'Maximum placement groups in region:';

export const NO_PLACEMENT_GROUPS_IN_SELECTED_REGION_MESSAGE =
  'There are no placement groups in this region.';

export const NO_REGIONS_SUPPORT_PLACEMENT_GROUPS_MESSAGE =
  'No regions currently support Placement Groups.';

export const CANNOT_CHANGE_PLACEMENT_GROUP_POLICY_MESSAGE =
  'Once you create a placement group, you cannot change its Placement Group Policy.';

// Links
export const PLACEMENT_GROUPS_DOCS_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/work-with-placement-groups';

// Text Copy
export const PLACEMENT_GROUP_POLICY_STRICT =
  'Allows the addition of more compute instances to the group as long as the placement group remains compliant.';

export const PLACEMENT_GROUP_POLICY_FLEXIBLE =
  "Allows the addition of more compute instances to the group even if it breaks the placement group's compliance.";

// Migrations
export const PLACEMENT_GROUP_MIGRATION_INBOUND_MESSAGE =
  'This Linode is migrating into this placement group. It will be available after the migration is complete.';

export const PLACEMENT_GROUP_MIGRATION_OUTBOUND_MESSAGE =
  'This Linode is being migrated. It will be removed from this placement group after the migration completes.';

export const PLACEMENT_GROUPS_LANDING_ROUTE = '/placement-groups';
export const PLACEMENT_GROUPS_DETAILS_ROUTE = '/placement-groups/$id';
// default order constants
export const PG_LANDING_TABLE_DEFAULT_ORDER = 'asc';
export const PG_LANDING_TABLE_DEFAULT_ORDER_BY = 'label';
export const PG_LANDING_TABLE_PREFERENCE_KEY = 'placement-groups';
export const PG_LINODES_TABLE_PREFERENCE_KEY = 'placement-groups-linodes';
