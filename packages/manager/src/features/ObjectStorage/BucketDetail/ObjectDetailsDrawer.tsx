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
import ACLSelect from './ACLSelect';

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    marginTop: 16,
    marginBottom: 16,
    height: 1,
    backgroundColor: '#EBEBEB'
  },
  copy: { marginTop: 16, padding: 0 },
  submitButton: { marginTop: theme.spacing(2) }
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

      <Divider className={classes.divider} />

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

      <Divider className={classes.divider} />

      {open && name ? (
        <ACLSelect
          variant="object"
          name={name}
          getACL={() => getObjectACL(clusterId, bucketName, name)}
          updateACL={(acl: ACLType) =>
            updateObjectACL(clusterId, bucketName, name, acl)
          }
        />
      ) : null}
    </Drawer>
  );
};

export default React.memo(ObjectDetailsDrawer);
