import { readableBytes } from '@akamai/compute-ui-core/api';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { pluralize, truncateMiddle } from '@akamai/compute-ui-core/formatting';
import { useProfile, useRegionQuery } from '@linode/queries';
import * as React from 'react';

import { AccessControls } from '../../shared/components/AccessControls/AccessControls';
import { CircleProgress } from '../../shared/components/CircleProgress/CircleProgress';
import { CopyTooltip } from '../../shared/components/CopyTooltip/CopyTooltip';
import { Divider } from '../../shared/components/Divider/Divider';
import { Drawer } from '../../shared/components/Drawer/Drawer';
import { ErrorState } from '../../shared/components/ErrorState/ErrorState';
import { Link } from '../../shared/components/Link/Link';
import { MaskableText } from '../../shared/components/MaskableText/MaskableText';
import { useObjectStorageBucket } from '../hooks/useObjectStorageBucket';

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
      <Drawer onClose={onClose} open={isOpen}>
        <span slot="header">
          {truncateMiddle(bucketName ?? 'Bucket Details')}
        </span>
        <div slot="body">
          <BucketDetailsDrawerContent
            bucketName={bucketName}
            regionId={regionId}
          />
        </div>
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
  const {
    data: region,
    isLoading: regionIsLoading,
    error: regionError,
  } = useRegionQuery(regionId ?? '');
  const {
    data: profile,
    isLoading: profileIsLoading,
    error: profileError,
  } = useProfile();
  const {
    bucket,
    isLoading: bucketIsLoading,
    error: bucketError,
  } = useObjectStorageBucket({
    bucketName: bucketName ?? '',
    regionId: regionId ?? '',
    enabled: Boolean(bucketName && regionId),
  });

  if (bucketIsLoading || regionIsLoading || profileIsLoading) {
    return <CircleProgress />;
  }

  if (bucketError || regionError || profileError) {
    const error = bucketError ?? regionError ?? profileError!;

    return <ErrorState errorText={error[0].reason} />;
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
        <p data-testid="createdTime">Created: {formattedCreated}</p>
      )}

      {Boolean(endpoint_type) && (
        <p data-testid="endpointType">Endpoint Type: {endpoint_type}</p>
      )}

      <p data-testid="region">{region?.label ?? ''}</p>

      {hostname && (
        <MaskableText isToggleable text={hostname}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
            <Link external to={`https://${hostname}`}>
              {truncateMiddle(hostname, 50)}
            </Link>

            <CopyTooltip text={hostname} />
          </div>
        </MaskableText>
      )}

      {(formattedCreated || endpoint_type || hostname) && (
        <Divider spacingBottom={16} spacingTop={16} />
      )}

      <p>{readableBytes(size).formatted}</p>

      <Link to={`/object-storage/buckets/${regionId}/${bucketName}`}>
        {pluralize('object', 'objects', objects)}
      </Link>

      <Divider spacingBottom={16} spacingTop={16} />

      <AccessControls
        endpointType={endpoint_type}
        name={bucketName}
        regionId={regionId}
        variant="bucket"
      />
    </>
  );
};
