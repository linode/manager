import React from 'react';

import { Link } from 'src/components/Link';

// @TODO LDE: Update "Learn more" link
export const DISK_ENCRYPTION_GENERAL_DESCRIPTION = (
  <>
    Secure this Linode using data at rest encryption. Data center systems take
    care of encrypting and decrypting for you. After the Linode is created, use
    Rebuild to enable or disable this feature. <Link to="">Learn more</Link>.
  </>
);

export const DISK_ENCRYPTION_DESCRIPTION_NODE_POOL_REBUILD_CAVEAT =
  'Encrypt Linode data at rest to improve security. The disk encryption setting for Linodes added to a node pool will not be changed after rebuild.';

export const DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY =
  'Disk encryption is not available in the selected region.';

export const DISK_ENCRYPTION_BACKUPS_CAVEAT_COPY =
  'Virtual Machine Backups are not encrypted.';
