import { formatDate } from '@akamai/compute-ui-core/datetime';
import { pluralize, truncateMiddle } from '@akamai/compute-ui-core/formatting';
import { useProfile, useRegionQuery } from '@linode/queries';
import { Divider, Drawer, Typography } from '@linode/ui';
import { readableBytes } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { MaskableText } from 'src/components/MaskableText/MaskableText';

import { AccessSelect } from '../BucketDetail/AccessTab/AccessSelect';

import type { ObjectStorageBucket } from '@linode/api-v4';

export interface BucketDetailsDrawerProps {
  bucket?: ObjectStorageBucket;
  isOpen: boolean;
  onClose: () => void;
}

export const BucketDetailsDrawer = React.memo(
  (props: BucketDetailsDrawerProps) => {
    const { onClose, isOpen, bucket } = props;

    const {
      created,
      endpoint_type,
      hostname,
      label: bucketName,
      objects,
      region: regionId,
      size,
    } = bucket ?? {};

    const { data: region } = useRegionQuery(regionId ?? '');
    const { data: profile } = useProfile();

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
        open={isOpen}
        title={truncateMiddle(bucketName ?? 'Bucket Detail')}
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
        <Typography data-testid="region" variant="subtitle2">
          {region?.label ?? ''}
        </Typography>
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
        {(formattedCreated || endpoint_type || hostname) && (
          <Divider spacingBottom={16} spacingTop={16} />
        )}
        {typeof size === 'number' && (
          <Typography variant="subtitle2">
            {readableBytes(size).formatted}
          </Typography>
        )}
        {typeof objects === 'number' && (
          <Link to={`/object-storage/buckets/${regionId}/${bucketName}`}>
            {pluralize('object', 'objects', objects)}
          </Link>
        )}
        {(typeof size === 'number' || typeof objects === 'number') && (
          <Divider spacingBottom={16} spacingTop={16} />
        )}
        {regionId && bucketName && (
          <AccessSelect
            endpointType={endpoint_type}
            name={bucketName}
            regionId={regionId}
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
