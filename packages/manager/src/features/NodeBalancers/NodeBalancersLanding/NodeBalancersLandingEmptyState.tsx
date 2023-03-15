import * as React from 'react';
import { useHistory } from 'react-router-dom';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';

const useStyles = makeStyles((theme: Theme) => ({
  placeholderAdjustment: {
    padding: `${theme.spacing(2)} 0 0 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing(10)} 0 0 0`,
    },
  },
}));

const NodeBalancerLandingEmptyState = () => {
  const history = useHistory();
  const classes = useStyles();

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="NodeBalancers" />
      <Placeholder
        title="NodeBalancers"
        isEntity
        icon={NodeBalancer}
        className={classes.placeholderAdjustment}
        buttonProps={[
          {
            onClick: () => history.push('/nodebalancers/create'),
            children: 'Create NodeBalancer',
          },
        ]}
        showTransferDisplay
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
      </Placeholder>
    </React.Fragment>
  );
};

export default React.memo(NodeBalancerLandingEmptyState);
