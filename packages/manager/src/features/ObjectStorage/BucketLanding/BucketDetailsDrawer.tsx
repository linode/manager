import { Divider, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
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

import type { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';

export interface BucketDetailsDrawerProps {
  onClose: () => void;
  open: boolean;
  selectedBucket: ObjectStorageBucket | undefined;
}

export const BucketDetailsDrawer = React.memo(
  (props: BucketDetailsDrawerProps) => {
    const { onClose, open, selectedBucket } = props;

    const {
      cluster,
      created,
      endpoint_type,
      hostname,
      label,
      objects,
      region,
      size,
    } = selectedBucket ?? {};

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
    const { data: currentRegion } = useRegionQuery(region ?? '');
    const { data: profile } = useProfile();

    // @TODO OBJGen2 - We could clean this up when OBJ Gen2 is in GA.
    const selectedCluster = clusters?.find((c) => c.id === cluster);
    const regionFromCluster = regions?.find(
      (r) => r.id === selectedCluster?.region
    );

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
        title={truncateMiddle(label ?? 'Bucket Detail')}
      >
        {formattedCreated && (
          <Typography data-testid="createdTime" variant="subtitle2">
            Created: {formattedCreated}
          </Typography>
        )}
        {Boolean(endpoint_type) && (
          <Typography data-testid="endpointType" variant="subtitle2">
            Endpoint Type: {endpoint_type}
          </Typography>
        )}
        {isObjMultiClusterEnabled ? (
          <Typography data-testid="cluster" variant="subtitle2">
            {currentRegion?.label}
          </Typography>
        ) : cluster ? (
          <Typography data-testid="cluster" variant="subtitle2">
            {regionFromCluster?.label ?? cluster}
          </Typography>
        ) : null}
        {hostname && (
          <MaskableText isToggleable text={hostname}>
            <StyledLinkContainer>
              <Link external to={`https://${hostname}`}>
                {truncateMiddle(hostname, 50)}
              </Link>
              <StyledCopyTooltip sx={{ marginLeft: 4 }} text={hostname} />
            </StyledLinkContainer>
          </MaskableText>
        )}
        {(formattedCreated || cluster) && (
          <Divider spacingBottom={16} spacingTop={16} />
        )}
        {typeof size === 'number' && (
          <Typography variant="subtitle2">
            {/* to convert from binary units (GiB) to decimal units (GB) we need to pass the base10 flag */}
            {readableBytes(size, { base10: true }).formatted}
          </Typography>
        )}
        {/* @TODO OBJ Multicluster: use region instead of cluster if isObjMultiClusterEnabled. */}
        {typeof objects === 'number' && (
          <Link
            to={`/object-storage/buckets/${
              isObjMultiClusterEnabled && selectedBucket ? region : cluster
            }/${label}`}
          >
            {pluralize('object', 'objects', objects)}
          </Link>
        )}
        {(typeof size === 'number' || typeof objects === 'number') && (
          <Divider spacingBottom={16} spacingTop={16} />
        )}
        {cluster && label && (
          <AccessSelect
            clusterOrRegion={
              isObjMultiClusterEnabled && currentRegion
                ? currentRegion.id
                : cluster
            }
            endpointType={endpoint_type}
            name={label}
            variant="bucket"
          />
        )}
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
