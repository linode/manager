import * as React from 'react';
import CopyTooltip from 'src/components/CopyTooltip';
import Divider from 'src/components/core/Divider';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import ExternalLink from 'src/components/ExternalLink';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import formatDate from 'src/utilities/formatDate';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';
import {
  getObjectACL,
  ObjectStorageObjectACL
} from '@linode/api-v4/lib/object-storage';

const useStyles = makeStyles(() => ({
  divider: {
    marginTop: 16,
    marginBottom: 16,
    height: 1,
    backgroundColor: '#EBEBEB'
  },
  copy: { marginTop: 16, padding: 0 }
}));

export interface Props {
  open: boolean;
  onClose: () => void;
  name?: string;
  size?: number | null;
  lastModified?: string | null;
  // enablePublicURL: () => void;
  url?: string;
  bucketName: string;
  clusterId: string;
}

const ObjectDetailsDrawer: React.FC<Props> = props => {
  const {
    open,
    onClose,
    name,
    size,
    lastModified,
    url,
    bucketName,
    clusterId
  } = props;

  const { data, loading, error } = useAPIRequest<ObjectStorageObjectACL | null>(
    open ? () => getObjectACL(clusterId, bucketName, name) : null,
    null,
    [open]
  );

  let formattedLastModified;
  try {
    if (lastModified) {
      formattedLastModified = formatDate(lastModified);
    }
  } catch {}

  const classes = useStyles();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={truncateMiddle(name ?? 'Object Detail')}
    >
      {size ? (
        <Typography variant="subtitle2">
          {readableBytes(size).formatted}
        </Typography>
      ) : null}
      {formattedLastModified ? (
        <Typography variant="subtitle2" data-testid="lastModified">
          Last modified: {formattedLastModified}
        </Typography>
      ) : null}

      <Divider className={classes.divider} />

      {/* ENABLE PUBLIC URL TOGGLE GOES HERE*/}

      {url ? (
        <>
          <ExternalLink link={url} text={truncateMiddle(url, 50)} />
          <CopyTooltip
            className={classes.copy}
            text={url}
            displayText="Copy to clipboard"
          />
        </>
      ) : null}
    </Drawer>
  );
};

export default React.memo(ObjectDetailsDrawer);
