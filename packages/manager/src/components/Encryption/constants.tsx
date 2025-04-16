import React from 'react';

import { Link } from 'src/components/Link';

/* Test IDs */
export const headerTestId = 'encryption-header';
export const descriptionTestId = 'encryption-description';
export const checkboxTestId = 'encrypt-entity-checkbox';

/* Disk Encryption constants */
const DISK_ENCRYPTION_GUIDE_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/local-disk-encryption';

export const DISK_ENCRYPTION_GENERAL_DESCRIPTION = (
  <>
    Secure this Linode with data-at-rest encryption. Data center systems handle
    encryption automatically for you. After the Linode is created, use Rebuild
    to enable or disable encryption.{' '}
    <Link to={DISK_ENCRYPTION_GUIDE_LINK}>Learn more</Link>.
  </>
);

export const DISK_ENCRYPTION_DISTRIBUTED_DESCRIPTION =
  'Distributed Compute Instances are secured using disk encryption. Encryption and decryption are automatically managed for you.';

export const DISK_ENCRYPTION_UPDATE_PROTECT_CLUSTERS_COPY = (
  <>
    Disk encryption is now standard on Linodes.{' '}
    <Link to={DISK_ENCRYPTION_GUIDE_LINK}>Learn how</Link> to update and protect
    your clusters.
  </>
);

export const DISK_ENCRYPTION_UPDATE_PROTECT_CLUSTERS_BANNER_KEY =
  'disk-encryption-update-protect-clusters-banner';

export const DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY =
  'Disk encryption is not available in the selected region. Select another region to use Disk Encryption.';

export const DISK_ENCRYPTION_DEFAULT_DISTRIBUTED_INSTANCES =
  'Distributed Compute Instances are encrypted. This setting can not be changed.';

// Guidance
export const UNENCRYPTED_STANDARD_LINODE_GUIDANCE_COPY =
  'Rebuild this Linode to enable or disable disk encryption.';

// Caveats
export const DISK_ENCRYPTION_DESCRIPTION_NODE_POOL_REBUILD_CAVEAT =
  'Encrypt Linode data at rest to improve security. The disk encryption setting for Linodes added to a node pool will not be changed after rebuild.';

export const DISK_ENCRYPTION_BACKUPS_CAVEAT_COPY =
  'Virtual Machine Backups are not encrypted.';

export const ENCRYPT_DISK_DISABLED_REBUILD_LKE_REASON =
  'The Encrypt Disk setting cannot be changed for a Linode attached to a node pool.';

export const ENCRYPT_DISK_DISABLED_REBUILD_DISTRIBUTED_REGION_REASON =
  'The Encrypt Disk setting cannot be changed for distributed instances.';

export const ENCRYPT_DISK_REBUILD_STANDARD_COPY =
  'Secure this Linode using data at rest encryption.';

export const ENCRYPT_DISK_REBUILD_LKE_COPY =
  'Secure this Linode using data at rest encryption. The disk encryption setting for Linodes added to a node pool will not be changed after rebuild.';

export const ENCRYPT_DISK_REBUILD_DISTRIBUTED_COPY =
  'Distributed Compute Instances are secured using disk encryption.';

/* Block Storage Encryption constants */
const BLOCK_STORAGE_ENCRYPTION_GUIDE_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/volumes-disk-encryption';

export const BLOCK_STORAGE_ENCRYPTION_GENERAL_DESCRIPTION = (
  <>
    Secure this volume using data at rest encryption. Data center systems take
    care of encrypting and decrypting for you. Once a volume is encrypted it
    cannot be undone.{' '}
    <Link to={BLOCK_STORAGE_ENCRYPTION_GUIDE_LINK}>Learn more</Link>.
  </>
);

export const BLOCK_STORAGE_CHOOSE_REGION_COPY =
  'Select a region to use Volume encryption.';

export const BLOCK_STORAGE_ENCRYPTION_UNAVAILABLE_IN_LINODE_REGION_COPY =
  "Volume encryption is not available in this Linode's region.";

export const BLOCK_STORAGE_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY = `Volume encryption is not available in the selected region. ${BLOCK_STORAGE_CHOOSE_REGION_COPY}`;

export const BLOCK_STORAGE_CLIENT_LIBRARY_UPDATE_REQUIRED_COPY =
  'This Linode requires a client library update and will need to be rebooted prior to attaching an encrypted volume.';

// Caveats
export const BLOCK_STORAGE_ENCRYPTION_OVERHEAD_CAVEAT =
  'Please note encryption overhead may impact your volume IOPS performance negatively. This may compound when multiple encryption-enabled volumes are attached to the same Linode.';

export const BLOCK_STORAGE_USER_SIDE_ENCRYPTION_CAVEAT =
  'User-side encryption on top of encryption-enabled volumes is discouraged at this time, as it could severely impact your volume performance.';

export const BLOCK_STORAGE_ENCRYPTION_SETTING_IMMUTABLE_COPY =
  'The encryption setting cannot be modified after a volume has been created.';

export const BLOCK_STORAGE_CLONING_INHERITANCE_CAVEAT =
  'Encryption is inherited from the source volume and cannot be changed when cloning volumes.';
