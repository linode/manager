import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { Typography } from 'src/components/Typography';

export const NodeBalancerLandingEmptyState = () => {
  const history = useHistory();

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="NodeBalancers" />
      <StyledPlaceholder
        buttonProps={[
          {
            children: 'Create NodeBalancer',
            onClick: () => history.push('/nodebalancers/create'),
          },
        ]}
        icon={NodeBalancer}
        isEntity
        showTransferDisplay
        title="NodeBalancers"
      >
        <Typography variant="subtitle1">
          <Link to="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/">
            Learn how to use NodeBalancers with your Linode
          </Link>
          &nbsp;or&nbsp;
          <Link to="https://www.linode.com/docs/">
            visit our guides and tutorials.
          </Link>
        </Typography>
      </StyledPlaceholder>
    </React.Fragment>
  );
};

const StyledPlaceholder = styled(Placeholder, {
  label: 'StyledPlaceholder',
})(({ theme }) => ({
  // this important rules can be removed when Placeholder is refactored
  // and we can just use sx={{ paddingBottom: 0 }} on placeholder
  padding: `${theme.spacing(10)} 0 0 0 !important`,
}));
