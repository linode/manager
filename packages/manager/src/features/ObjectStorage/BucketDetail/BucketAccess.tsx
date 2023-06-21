import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { AccessSelect } from './AccessSelect';
import { styled } from '@mui/material/styles';
import {
  ACLType,
  getBucketAccess,
  updateBucketAccess,
} from '@linode/api-v4/lib/object-storage';

export const StyledRootContainer = styled(Paper, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  padding: theme.spacing(3),
}));

interface Props {
  bucketName: string;
  clusterId: string;
}

export const BucketAccess = React.memo((props: Props) => {
  const { bucketName, clusterId } = props;

  return (
    <StyledRootContainer>
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
    </StyledRootContainer>
  );
});
