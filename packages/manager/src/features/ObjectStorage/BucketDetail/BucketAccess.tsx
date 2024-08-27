import {
  getBucketAccess,
  updateBucketAccess,
} from '@linode/api-v4/lib/object-storage';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

import { AccessSelect } from './AccessSelect';

import type {
  ACLType,
  ObjectStorageEndpointTypes,
} from '@linode/api-v4/lib/object-storage';

export const StyledRootContainer = styled(Paper, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  padding: theme.spacing(3),
}));

interface Props {
  bucketName: string;
  clusterId: string;
  endpointType?: ObjectStorageEndpointTypes;
}

export const BucketAccess = React.memo((props: Props) => {
  const { bucketName, clusterId, endpointType } = props;

  return (
    <StyledRootContainer>
      <Typography variant="h2">Bucket Access</Typography>
      <AccessSelect
        updateAccess={(acl: ACLType, cors_enabled: boolean) => {
          // Don't send the ACL with the payload if it's "custom", since it's
          // not valid (though it's a valid return type).
          const payload =
            acl === 'custom' ? { cors_enabled } : { acl, cors_enabled };

          return updateBucketAccess(clusterId, bucketName, payload);
        }}
        endpointType={endpointType}
        getAccess={() => getBucketAccess(clusterId, bucketName)}
        name={bucketName}
        variant="bucket"
      />
    </StyledRootContainer>
  );
});
