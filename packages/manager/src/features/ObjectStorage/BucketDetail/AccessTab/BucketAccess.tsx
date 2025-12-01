import { Paper, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { AccessSelect } from './AccessSelect';

import type { ObjectStorageEndpointTypes } from '@linode/api-v4/lib/object-storage';

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
        clusterOrRegion={clusterId}
        endpointType={endpointType}
        name={bucketName}
        variant="bucket"
      />
    </StyledRootContainer>
  );
});
