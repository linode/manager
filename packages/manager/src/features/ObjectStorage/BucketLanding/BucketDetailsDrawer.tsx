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
import { useObjectStorageClusters } from 'src/queries/objectStorage';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { formatDate } from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';

import { AccessSelect } from '../BucketDetail/AccessSelect';
export interface BucketDetailsDrawerProps {
  bucketLabel?: string;
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
      cluster,
      created,
      hostname,
      objectsNumber,
      onClose,
      open,
      size,
    } = props;

    const { data: clusters } = useObjectStorageClusters();
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

        {cluster ? (
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

        {typeof objectsNumber === 'number' ? (
          <Link to={`/object-storage/buckets/${cluster}/${bucketLabel}`}>
            {pluralize('object', 'objects', objectsNumber)}
          </Link>
        ) : null}

        {typeof size === 'number' || typeof objectsNumber === 'number' ? (
          <Divider spacingBottom={16} spacingTop={16} />
        ) : null}

        {cluster && bucketLabel ? (
          <AccessSelect
            updateAccess={(acl: ACLType, cors_enabled: boolean) => {
              // Don't send the ACL with the payload if it's "custom", since it's
              // not valid (though it's a valid return type).
              const payload =
                acl === 'custom' ? { cors_enabled } : { acl, cors_enabled };

              return updateBucketAccess(cluster, bucketLabel, payload);
            }}
            getAccess={() => getBucketAccess(cluster, bucketLabel)}
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
