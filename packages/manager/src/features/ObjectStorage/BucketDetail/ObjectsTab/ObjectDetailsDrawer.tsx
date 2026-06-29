import { readableBytes } from '@akamai/compute-ui-core/api';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { truncateMiddle } from '@akamai/compute-ui-core/formatting';
import { useProfile } from '@linode/queries';
import { CircleProgress, Divider, Drawer, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { useObjectStorageBuckets } from 'src/features/ObjectStorage/hooks/useObjectStorageBuckets';

import { AccessSelect } from '../AccessTab/AccessSelect';

export interface ObjectDetailsDrawerProps {
  bucketName: string;
  displayName?: string;
  lastModified?: null | string;
  name?: string;
  onClose: () => void;
  open: boolean;
  regionId: string;
  size?: null | number;
  url?: string;
}

export const ObjectDetailsDrawer = React.memo(
  (props: ObjectDetailsDrawerProps) => {
    const {
      bucketName,
      regionId,
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
    const { data: buckets, isLoading: isLoadingEndpointData } =
      useObjectStorageBuckets();

    const isLoadingEndpoint = isLoadingEndpointData || !buckets;

    const bucket = buckets?.find(
      ({ label, region }) => label === bucketName && region === regionId
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
        onClose={onClose}
        open={open}
        title={truncateMiddle(displayName ?? 'Object Detail')}
      >
        {size ? (
          <Typography variant="subtitle2">
            {readableBytes(size).formatted}
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
              endpointType={endpointType}
              name={name}
              regionId={regionId}
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
