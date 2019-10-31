import { NEWCreateNodeBalancerConfigPayload } from 'linode-js-sdk/lib/nodebalancers';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ExpansionPanel from 'src/components/ExpansionPanel';

import withNodeBalancerConfigs, {
  Props as ConfigProps,
  StateProps
} from 'src/containers/__new__/nodeBalancerConfigs.container';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(2)
  }
}));

interface Props {
  nodeBalancerID: number;
  nodeBalancerRegion: string;
  nodeBalancerLabel: string;
}

type CombinedProps = Props & ConfigProps;

const EditNodeBalancerConfigs: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [newConfigs, setNewConfigs] = React.useState<
    NEWCreateNodeBalancerConfigPayload[]
  >([]);

  const {
    nodeBalancerLabel,
    // nodeBalancerRegion,
    nodeBalancerConfigsData
  } = props;

  const hasNoConfigs = !Object.keys(nodeBalancerConfigsData).length;

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`${nodeBalancerLabel} - Configurations`} />
      <Typography variant="h1" data-qa-title className={classes.title}>
        NodeBalancer Configurations
      </Typography>
      {/** map over existing configs */
      Object.keys(nodeBalancerConfigsData).map(eachKey => {
        return (
          <ExpansionPanel key={`config-${eachKey}`} heading="hello world" />
        );
      })}
      {/** map over new configs */
      newConfigs.map((eachConfig, idx) => {
        return <ExpansionPanel key={`config-${idx}`} heading="hello world" />;
      })}
      <Button
        buttonType="secondary"
        onClick={() =>
          setNewConfigs([...newConfigs, generateDefaultNodeBalancerConfig()])
        }
        data-qa-add-config
      >
        {hasNoConfigs ? 'Add a Configuration' : 'Add another Configuration'}
      </Button>
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withNodeBalancerConfigs<StateProps, Props>(
    (ownProps, { nodeBalancerConfigsData, ...rest }) => ({
      nodeBalancerConfigsData: Object.keys(nodeBalancerConfigsData).reduce(
        (acc, eachKey) => {
          /** return us just the configs that are attached to this nodebalancer */
          if (
            nodeBalancerConfigsData[eachKey].nodebalancer_id ===
            ownProps.nodeBalancerID
          ) {
            acc[eachKey] = nodeBalancerConfigsData[eachKey];
          }

          return acc;
        },
        {}
      ),
      ...rest
    })
  )
)(EditNodeBalancerConfigs);

/**
 * generates a new nodebalancer config with defaults
 */
const generateDefaultNodeBalancerConfig = (): NEWCreateNodeBalancerConfigPayload => ({
  port: 0,
  protocol: 'http',
  algorithm: 'roundrobin',
  stickiness: 'table',
  check_attempts: 2,
  check_interval: 5,
  check_passive: true,
  check_timeout: 3,
  check: 'none',
  ssl_cert: '',
  ssl_key: '',
  check_body: '',
  check_path: '',
  cipher_suite: 'recommended'
});
