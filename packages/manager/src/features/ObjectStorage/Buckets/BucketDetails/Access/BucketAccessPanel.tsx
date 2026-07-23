import { Paper, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { AccessControls } from '../../../shared/components/AccessControls/AccessControls';

import type { ObjectStorageEndpointTypes } from '@linode/api-v4/lib/object-storage';

export const StyledRootContainer = styled(Paper, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  padding: theme.spacing(3),
}));

interface Props {
  bucketName: string;
  endpointType?: ObjectStorageEndpointTypes;
  regionId: string;
}

export const BucketAccessPanel = React.memo((props: Props) => {
  const { bucketName, regionId, endpointType } = props;

  return (
    <StyledRootContainer>
      <Typography variant="h2">Bucket Access</Typography>
      <AccessControls
        endpointType={endpointType}
        name={bucketName}
        regionId={regionId}
        variant="bucket"
      />
    </StyledRootContainer>
  );
});
