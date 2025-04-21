import { useProfile } from '@linode/queries';
import { CircleProgress, Divider, Drawer, Typography } from '@linode/ui';
import { readableBytes, truncateMiddle } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import { useIsObjectStorageGen2Enabled } from 'src/features/ObjectStorage/hooks/useIsObjectStorageGen2Enabled';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import { formatDate } from 'src/utilities/formatDate';

import { AccessSelect } from './AccessSelect';

export interface ObjectDetailsDrawerProps {
  bucketName: string;
  clusterId: string;
  displayName?: string;
  lastModified?: null | string;
  name?: string;
  onClose: () => void;
  open: boolean;
  size?: null | number;
  url?: string;
}

export const ObjectDetailsDrawer = React.memo(
  (props: ObjectDetailsDrawerProps) => {
    const {
      bucketName,
      clusterId,
      displayName,
      lastModified,
      name,
      onClose,
      open,
      size,
      url,
    } = props;
    let formattedLastModified;

    const { data: profile } = useProfile();
    const { isObjectStorageGen2Enabled } = useIsObjectStorageGen2Enabled();
    const { data: bucketsData, isLoading: isLoadingEndpointData } =
      useObjectStorageBuckets(isObjectStorageGen2Enabled);

    const isLoadingEndpoint = isLoadingEndpointData || !bucketsData;

    const bucket = bucketsData?.buckets.find(
      ({ label }) => label === bucketName
    );

    const { endpoint_type: endpointType } = bucket ?? {};

    try {
      if (lastModified) {
        formattedLastModified = formatDate(lastModified, {
          timezone: profile?.timezone,
        });
      }
    } catch {}

    const isEndpointTypeE2E3 = endpointType === 'E2' || endpointType === 'E3';
    const isAccessSelectEnabled = open && name && !isEndpointTypeE2E3;
    const shouldShowAccessSelect = !isLoadingEndpoint && isAccessSelectEnabled;

    return (
      <Drawer
        NotFoundComponent={NotFound}
        onClose={onClose}
        open={open}
        title={truncateMiddle(displayName ?? 'Object Detail')}
      >
        {size ? (
          <Typography variant="subtitle2">
            {/* to convert from binary units (GiB) to decimal units (GB) we need to pass the base10 flag */}
            {readableBytes(size, { base10: true }).formatted}
          </Typography>
        ) : null}
        {formattedLastModified && Boolean(profile) ? (
          <Typography data-testid="lastModified" variant="subtitle2">
            Last modified: {formattedLastModified}
          </Typography>
        ) : null}

        {url ? (
          <StyledLinkContainer>
            <Link bypassSanitization external to={url}>
              {truncateMiddle(url, 50)}
            </Link>
            <StyledCopyTooltip sx={{ marginLeft: 4 }} text={url} />
          </StyledLinkContainer>
        ) : null}

        {isLoadingEndpoint ? (
          <CircleProgress />
        ) : shouldShowAccessSelect ? (
          <>
            <Divider spacingBottom={16} spacingTop={16} />
            <AccessSelect
              bucketName={bucketName}
              clusterOrRegion={clusterId}
              endpointType={endpointType}
              name={name}
              variant="object"
            />
          </>
        ) : null}
      </Drawer>
    );
  }
);

const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(() => ({
  marginLeft: '1em',
  padding: 0,
}));

const StyledLinkContainer = styled('div', {
  label: 'StyledLinkContainer',
})(() => ({
  display: 'flex',
}));
