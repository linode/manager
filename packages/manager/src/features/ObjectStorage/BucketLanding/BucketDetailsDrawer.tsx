import {
  ACLType,
  getBucketAccess,
  updateBucketAccess,
} from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { Link } from 'react-router-dom';
import CopyTooltip from 'src/components/CopyTooltip';
import Divider from 'src/components/core/Divider';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import ExternalLink from 'src/components/ExternalLink';
import formatDate from 'src/utilities/formatDate';
import { formatObjectStorageCluster } from 'src/utilities/formatRegion';
import { pluralize } from 'src/utilities/pluralize';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';
import AccessSelect from '../BucketDetail/AccessSelect';

const useStyles = makeStyles(() => ({
  copy: {
    marginLeft: '1em',
    padding: 0,
  },
  link: {
    display: 'flex',
  },
}));

export interface Props {
  open: boolean;
  onClose: () => void;
  bucketLabel?: string;
  hostname?: string;
  created?: string;
  cluster?: string;
  size?: number | null;
  objectsNumber?: number;
}

const BucketDetailsDrawer: React.FC<Props> = (props) => {
  const {
    open,
    onClose,
    bucketLabel,
    hostname,
    created,
    cluster,
    size,
    objectsNumber,
  } = props;

  let formattedCreated;
  try {
    if (created) {
      formattedCreated = formatDate(created);
    }
  } catch {}

  const classes = useStyles();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={truncateMiddle(bucketLabel ?? 'Bucket Detail')}
    >
      {formattedCreated ? (
        <Typography variant="subtitle2" data-testid="createdTime">
          Created: {formattedCreated}
        </Typography>
      ) : null}

      {cluster ? (
        <Typography variant="subtitle2" data-testid="cluster">
          {formatObjectStorageCluster(cluster)}
        </Typography>
      ) : null}

      {hostname ? (
        <span className={classes.link}>
          <ExternalLink
            hideIcon
            link={`https://${hostname}`}
            text={truncateMiddle(hostname, 50)}
          />
          <CopyTooltip className={classes.copy} text={hostname} />
        </span>
      ) : null}

      {formattedCreated || cluster ? (
        <Divider spacingTop={16} spacingBottom={16} />
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
        <Divider spacingTop={16} spacingBottom={16} />
      ) : null}

      {cluster && bucketLabel ? (
        <AccessSelect
          variant="bucket"
          name={bucketLabel}
          getAccess={() => getBucketAccess(cluster, bucketLabel)}
          updateAccess={(acl: ACLType, cors_enabled: boolean) => {
            // Don't send the ACL with the payload if it's "custom", since it's
            // not valid (though it's a valid return type).
            const payload =
              acl === 'custom' ? { cors_enabled } : { acl, cors_enabled };

            return updateBucketAccess(cluster, bucketLabel, payload);
          }}
        />
      ) : null}
    </Drawer>
  );
};

export default React.memo(BucketDetailsDrawer);
