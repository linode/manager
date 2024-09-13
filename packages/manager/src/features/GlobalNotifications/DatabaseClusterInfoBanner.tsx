import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';

import { useIsDatabasesEnabled } from '../Databases/utilities';

const StyledNotice = styled(Notice, { label: 'StyledNotice' })(({ theme }) => ({
  background: theme.bg.bgPaper,
  marginTop: '15px',
}));

export const DatabaseClusterInfoBanner = () => {
  const { isDatabasesV2Enabled } = useIsDatabasesEnabled();

  if (!isDatabasesV2Enabled) {
    return null;
  }

  return (
    <StyledNotice variant="info">
      <Box>
        <Typography variant="h3">
          Important Database Cluster Beta Information
        </Typography>
        <ul style={{ margin: '10px 0' }}>
          <li>
            <Typography variant="body2">
              As a Beta customer you can only create Aiven Database clusters.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              You won’t be charged for Aiven database clusters created during
              duration of the Beta phase. If you decide to keep the new clusters
              later on, you’ll be charged according to the new payment. You can
              always remove unwanted clusters.
            </Typography>
          </li>
        </ul>
      </Box>
    </StyledNotice>
  );
};
