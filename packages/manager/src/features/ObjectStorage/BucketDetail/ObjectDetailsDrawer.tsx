import {
  ACLType,
  getObjectACL,
  updateObjectACL
} from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import CopyTooltip from 'src/components/CopyTooltip';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import ExternalLink from 'src/components/ExternalLink';
import formatDate from 'src/utilities/formatDate';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';
import AccessSelect from './AccessSelect';

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    marginTop: 16,
    marginBottom: 16,
    height: 1,
    backgroundColor: '#EBEBEB'
  },
  copy: {
    marginLeft: '1em',
    padding: 0
  },
  link: {
    display: 'flex'
  },
  submitButton: {
    marginTop: theme.spacing(2)
  }
}));

export interface Props {
  open: boolean;
  onClose: () => void;
  name?: string;
  displayName?: string;
  size?: number | null;
  lastModified?: string | null;
  url?: string;
  bucketName: string;
  clusterId: string;
}

const ObjectDetailsDrawer: React.FC<Props> = props => {
  const classes = useStyles();

  const {
    open,
    onClose,
    name,
    displayName,
    size,
    lastModified,
    url,
    bucketName,
    clusterId
  } = props;

  let formattedLastModified;
  try {
    if (lastModified) {
      formattedLastModified = formatDate(lastModified);
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
      {formattedLastModified ? (
        <Typography variant="subtitle2" data-testid="lastModified">
          Last modified: {formattedLastModified}
        </Typography>
      ) : null}

      {url ? (
        <div className={classes.link}>
          <ExternalLink hideIcon link={url} text={truncateMiddle(url, 50)} />
          <CopyTooltip className={classes.copy} text={url} />
        </div>
      ) : null}

      {open && name ? (
        <>
          <Divider className={classes.divider} />
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
};

export default React.memo(ObjectDetailsDrawer);
