import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import formatDate from 'src/utilities/formatDate';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';

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
      {hostname ? (
        <Typography variant="subtitle2" data-testid="hostname">
          {hostname}
        </Typography>
      ) : null}

      {formattedCreated ? (
        <Typography variant="subtitle2" data-testid="createdTime">
          Created: {formattedCreated}
        </Typography>
      ) : null}

      {cluster ? (
        <Typography variant="subtitle2" data-testid="cluster">
          Cluster: {cluster}
        </Typography>
      ) : null}

      {(hostname || formattedCreated || cluster) && (
        <Divider className={classes.divider} />
      )}

      {size ? (
        <Typography variant="subtitle2">
          {readableBytes(size).formatted}
        </Typography>
      ) : null}

      {objectsNumber ? (
        <Typography variant="subtitle2">
          Number of Objects: {objectsNumber}
        </Typography>
      ) : null}

      {size || objectsNumber ? <Divider className={classes.divider} /> : null}

      {aclControl ? (
        <Typography variant="subtitle2">{aclControl}</Typography>
      ) : null}

      {corsControl ? (
        <Typography variant="subtitle2">{corsControl}</Typography>
      ) : null}
    </Drawer>
  );
};

export default React.memo(BucketDetailsDrawer);
