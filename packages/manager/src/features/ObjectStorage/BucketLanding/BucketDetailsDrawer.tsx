import {
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
import { useObjectStorageClusters } from 'src/queries/object-storage/queries';
import { useProfile } from 'src/queries/profile/profile';
import { useRegionQuery, useRegionsQuery } from 'src/queries/regions/regions';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';
import { formatDate } from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';

import { AccessSelect } from '../BucketDetail/AccessSelect';

import type {
  ACLType,
  ObjectStorageBucket,
} from '@linode/api-v4/lib/object-storage';

export interface BucketDetailsDrawerProps {
  onClose: () => void;
  open: boolean;
  selectedBucket: ObjectStorageBucket | undefined;
}

export const BucketDetailsDrawer = React.memo(
  (props: BucketDetailsDrawerProps) => {
    const { onClose, open, selectedBucket } = props;

    const bucketLabel = selectedBucket?.label;
    const cluster = selectedBucket?.cluster;
    const created = selectedBucket?.created;
    const hostname = selectedBucket?.hostname;
    const objectsNumber = selectedBucket?.objects;
    const size = selectedBucket?.size;

    const flags = useFlags();
    const { account } = useAccountManagement();

    const isObjMultiClusterEnabled = isFeatureEnabledV2(
      'Object Storage Access Key Regions',
      Boolean(flags.objMultiCluster),
      account?.capabilities ?? []
    );

    // @TODO OBJGen2 - We could clean this up when OBJ Gen2 is in GA.
    const { data: clusters } = useObjectStorageClusters(
      !isObjMultiClusterEnabled
    );
    const { data: regions } = useRegionsQuery();
    const { data: currentRegion } = useRegionQuery(
      selectedBucket?.region ?? ''
    );
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
            {currentRegion?.label}
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
              isObjMultiClusterEnabled && selectedBucket
                ? selectedBucket.region
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
                isObjMultiClusterEnabled && currentRegion
                  ? currentRegion.id
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
                isObjMultiClusterEnabled && currentRegion
                  ? currentRegion.id
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
