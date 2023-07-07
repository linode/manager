import * as React from 'react';
import { Divider } from 'src/components/Divider';
import Drawer from 'src/components/Drawer';
import ExternalLink from 'src/components/ExternalLink';
import formatDate from 'src/utilities/formatDate';
import { Typography } from 'src/components/Typography';
import { AccessSelect } from './AccessSelect';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { readableBytes } from 'src/utilities/unitConversions';
import { styled } from '@mui/material/styles';
import { truncateMiddle } from 'src/utilities/truncate';
import { useProfile } from 'src/queries/profile';
import {
  ACLType,
  getObjectACL,
  updateObjectACL,
} from '@linode/api-v4/lib/object-storage';

export interface ObjectDetailsDrawerProps {
  bucketName: string;
  clusterId: string;
  displayName?: string;
  lastModified?: string | null;
  name?: string;
  onClose: () => void;
  open: boolean;
  size?: number | null;
  url?: string;
}

export const ObjectDetailsDrawer = React.memo(
  (props: ObjectDetailsDrawerProps) => {
    const { data: profile } = useProfile();
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

    try {
      if (lastModified) {
        formattedLastModified = formatDate(lastModified, {
          timezone: profile?.timezone,
        });
      }
    } catch {}

    return (
      <Drawer
        open={open}
        onClose={onClose}
        title={truncateMiddle(displayName ?? 'Object Detail')}
      >
        {size ? (
          <Typography variant="subtitle2">
            {readableBytes(size).formatted}
          </Typography>
        ) : null}
        {formattedLastModified && Boolean(profile) ? (
          <Typography variant="subtitle2" data-testid="lastModified">
            Last modified: {formattedLastModified}
          </Typography>
        ) : null}

        {url ? (
          <StyledLinkContainer>
            <ExternalLink hideIcon link={url} text={truncateMiddle(url, 50)} />
            <StyledCopyTooltip text={url} />
          </StyledLinkContainer>
        ) : null}

        {open && name ? (
          <>
            <Divider spacingTop={16} spacingBottom={16} />
            <AccessSelect
              variant="object"
              name={name}
              getAccess={() => getObjectACL(clusterId, bucketName, name)}
              updateAccess={(acl: ACLType) =>
                updateObjectACL(clusterId, bucketName, name, acl)
              }
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
