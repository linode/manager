import { useProfile, useRegionQuery, useRegionsQuery } from '@linode/queries';
import { Divider, Drawer, Typography } from '@linode/ui';
import { pluralize, readableBytes, truncateMiddle } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { formatDate } from 'src/utilities/formatDate';

import { AccessSelect } from '../BucketDetail/AccessTab/AccessSelect';

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

    const { data: currentRegion } = useRegionQuery(region ?? '');
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
        <Typography data-testid="cluster" variant="subtitle2">
          {currentRegion?.label}
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
        {(formattedCreated || cluster) && (
          <Divider spacingBottom={16} spacingTop={16} />
        )}
        {typeof size === 'number' && (
          <Typography variant="subtitle2">
            {readableBytes(size).formatted}
          </Typography>
        )}
        {typeof objects === 'number' && (
          <Link to={`/object-storage/buckets/${region}/${label}`}>
            {pluralize('object', 'objects', objects)}
          </Link>
        )}
        {(typeof size === 'number' || typeof objects === 'number') && (
          <Divider spacingBottom={16} spacingTop={16} />
        )}
        {cluster && label && (
          <AccessSelect
            clusterOrRegion={currentRegion?.id}
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
