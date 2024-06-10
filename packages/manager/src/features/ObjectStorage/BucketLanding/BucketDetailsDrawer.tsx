import { Region } from '@linode/api-v4';
import {
  ACLType,
  getBucketAccess,
  updateBucketAccess,
} from '@linode/api-v4/lib/object-storage';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { useObjectStorageClusters } from 'src/queries/objectStorage';
import { useProfile } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { formatDate } from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';

import { AccessSelect } from '../BucketDetail/AccessSelect';
export interface BucketDetailsDrawerProps {
  bucketLabel?: string;
  bucketRegion?: Region;
  cluster?: string;
  created?: string;
  hostname?: string;
  objectsNumber?: number;
  onClose: () => void;
  open: boolean;
  size?: null | number;
}

export const BucketDetailsDrawer = React.memo(
  (props: BucketDetailsDrawerProps) => {
    const {
      bucketLabel,
      bucketRegion,
      cluster,
      created,
      hostname,
      objectsNumber,
      onClose,
      open,
      size,
    } = props;

    const flags = useFlags();
    const { account } = useAccountManagement();

    const isObjMultiClusterEnabled = isFeatureEnabled(
      'Object Storage Access Key Regions',
      Boolean(flags.objMultiCluster),
      account?.capabilities ?? []
    );

    // @TODO OBJ Multicluster: Once the feature is rolled out to production, we can clean this up by removing the useObjectStorageClusters and useRegionsQuery, which will not be required at that time.
    const { data: clusters } = useObjectStorageClusters(
      !isObjMultiClusterEnabled
    );
    const { data: regions } = useRegionsQuery();
    const { data: profile } = useProfile();
    const actualCluster = clusters?.find((c) => c.id === cluster);
    const region = regions?.find((r) => r.id === actualCluster?.region);
    let formattedCreated;

    try {
      if (created) {
        formattedCreated = formatDate(created, {
          timezone: profile?.timezone,
        });
      }
    } catch {}

    return (
      <Drawer
        onClose={onClose}
        open={open}
        title={truncateMiddle(bucketLabel ?? 'Bucket Detail')}
      >
        {formattedCreated ? (
          <Typography data-testid="createdTime" variant="subtitle2">
            Created: {formattedCreated}
          </Typography>
        ) : null}
        {isObjMultiClusterEnabled ? (
          <Typography data-testid="cluster" variant="subtitle2">
            {bucketRegion?.label}
          </Typography>
        ) : cluster ? (
          <Typography data-testid="cluster" variant="subtitle2">
            {region?.label ?? cluster}
          </Typography>
        ) : null}
        {hostname ? (
          <StyledLinkContainer>
            <Link external to={`https://${hostname}`}>
              {truncateMiddle(hostname, 50)}
            </Link>
            <StyledCopyTooltip sx={{ marginLeft: 4 }} text={hostname} />
          </StyledLinkContainer>
        ) : null}
        {formattedCreated || cluster ? (
          <Divider spacingBottom={16} spacingTop={16} />
        ) : null}
        {typeof size === 'number' ? (
          <Typography variant="subtitle2">
            {readableBytes(size).formatted}
          </Typography>
        ) : null}
        {/* @TODO OBJ Multicluster: use region instead of cluster if isObjMultiClusterEnabled. */}
        {typeof objectsNumber === 'number' ? (
          <Link
            to={`/object-storage/buckets/${
              isObjMultiClusterEnabled && bucketRegion
                ? bucketRegion.id
                : cluster
            }/${bucketLabel}`}
          >
            {pluralize('object', 'objects', objectsNumber)}
          </Link>
        ) : null}
        {typeof size === 'number' || typeof objectsNumber === 'number' ? (
          <Divider spacingBottom={16} spacingTop={16} />
        ) : null}
        {/* @TODO OBJ Multicluster: use region instead of cluster if isObjMultiClusterEnabled
         to getBucketAccess and updateBucketAccess.  */}
        {cluster && bucketLabel ? (
          <AccessSelect
            getAccess={() =>
              getBucketAccess(
                isObjMultiClusterEnabled && bucketRegion
                  ? bucketRegion.id
                  : cluster,
                bucketLabel
              )
            }
            updateAccess={(acl: ACLType, cors_enabled: boolean) => {
              // Don't send the ACL with the payload if it's "custom", since it's
              // not valid (though it's a valid return type).
              const payload =
                acl === 'custom' ? { cors_enabled } : { acl, cors_enabled };

              return updateBucketAccess(
                isObjMultiClusterEnabled && bucketRegion
                  ? bucketRegion.id
                  : cluster,
                bucketLabel,
                payload
              );
            }}
            name={bucketLabel}
            variant="bucket"
          />
        ) : null}
      </Drawer>
    );
  }
);

const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledRootContainer',
})(() => ({
  marginLeft: '1em',
  padding: 0,
}));

const StyledLinkContainer = styled('span', {
  label: 'StyledLinkContainer',
})(() => ({
  display: 'flex',
}));
