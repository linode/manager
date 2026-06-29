import { readableBytes } from '@akamai/compute-ui-core/api';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { pluralize, truncateMiddle } from '@akamai/compute-ui-core/formatting';
import { useProfile, useRegionQuery } from '@linode/queries';
import { CircleProgress, Divider, Drawer, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { useObjectStorageBucket } from 'src/queries/object-storage/queries';

import { AccessSelect } from '../BucketDetail/AccessTab/AccessSelect';

export interface BucketDetailsDrawerProps {
  bucketName?: string;
  isOpen: boolean;
  onClose: () => void;
  regionId?: string;
}

export const BucketDetailsDrawer = React.memo(
  (props: BucketDetailsDrawerProps) => {
    const { onClose, isOpen, bucketName, regionId } = props;

    return (
      <Drawer
        onClose={onClose}
        open={isOpen}
        title={truncateMiddle(bucketName ?? 'Bucket Details')}
      >
        <BucketDetailsDrawerContent
          bucketName={bucketName}
          regionId={regionId}
        />
      </Drawer>
    );
  }
);

interface BucketDetailsDrawerContentProps {
  bucketName?: string;
  regionId?: string;
}

const BucketDetailsDrawerContent = ({
  bucketName,
  regionId,
}: BucketDetailsDrawerContentProps) => {
  const { data: region, isLoading: regionIsLoading } = useRegionQuery(
    regionId ?? ''
  );
  const { data: profile, isLoading: profileIsLoading } = useProfile();
  const { data: bucket, isLoading: bucketIsLoading } = useObjectStorageBucket({
    bucketName: bucketName ?? '',
    regionId: regionId ?? '',
    enabled: Boolean(bucketName && regionId),
  });

  if (bucketIsLoading || regionIsLoading || profileIsLoading) {
    return <CircleProgress />;
  }

  if (!bucket || !regionId || !bucketName) {
    return null;
  }

  const { created, endpoint_type, hostname, objects, size } = bucket;

  let formattedCreated;

  try {
    if (created) {
      formattedCreated = formatDate(created, {
        timezone: profile?.timezone,
      });
    }
  } catch {}

  return (
    <>
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

      <Typography variant="subtitle2">
        {readableBytes(size).formatted}
      </Typography>

      <Link to={`/object-storage/buckets/${regionId}/${bucketName}`}>
        {pluralize('object', 'objects', objects)}
      </Link>

      <Divider spacingBottom={16} spacingTop={16} />

      <AccessSelect
        endpointType={endpoint_type}
        name={bucketName}
        regionId={regionId}
        variant="bucket"
      />
    </>
  );
};

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
