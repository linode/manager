import {
  ACLType,
  getBucketAccess,
  updateBucketAccess,
} from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import AccessSelect from './AccessSelect';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
  },
}));

interface Props {
  bucketName: string;
  clusterId: string;
}

export const BucketAccess: React.FC<Props> = props => {
  const classes = useStyles();

  const { bucketName, clusterId } = props;

  return (
    <Paper className={classes.root}>
      <Typography variant="h2">Bucket Access</Typography>
      <AccessSelect
        variant="bucket"
        name={bucketName}
        getAccess={() => getBucketAccess(clusterId, bucketName)}
        updateAccess={(acl: ACLType, cors_enabled: boolean) => {
          // Don't send the ACL with the payload if it's "custom", since it's
          // not valid (though it's a valid return type).
          const payload =
            acl === 'custom' ? { cors_enabled } : { acl, cors_enabled };

          return updateBucketAccess(clusterId, bucketName, payload);
        }}
      />
    </Paper>
  );
};

export default React.memo(BucketAccess);
