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

const useStyles = makeStyles(() => ({
  divider: {
    marginTop: 16,
    marginBottom: 16,
    height: 1,
    backgroundColor: '#EBEBEB'
  },
  copy: {
    marginTop: 16,
    padding: 0
  }
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
  aclControl?: any;
  corsControl?: any;
}

const BucketDetailsDrawer: React.FC<Props> = props => {
  const {
    open,
    onClose,
    bucketLabel,
    hostname,
    created,
    cluster,
    size,
    objectsNumber,
    aclControl,
    corsControl
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

      {formattedCreated || cluster ? (
        <Divider className={classes.divider} />
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
        <Divider className={classes.divider} />
      ) : null}

      {aclControl ? (
        <Typography variant="subtitle2">{aclControl}</Typography>
      ) : null}

      <Typography variant="subtitle2">
        {corsControl ? 'CORS enabled' : 'CORS disabled'}
      </Typography>

      {hostname ? <Divider className={classes.divider} /> : null}

      {hostname ? (
        <>
          <ExternalLink link={hostname} text={truncateMiddle(hostname, 50)} />
          <CopyTooltip
            className={classes.copy}
            text={hostname}
            displayText="Copy to clipboard"
          />
        </>
      ) : null}
    </Drawer>
  );
};

export default React.memo(BucketDetailsDrawer);
