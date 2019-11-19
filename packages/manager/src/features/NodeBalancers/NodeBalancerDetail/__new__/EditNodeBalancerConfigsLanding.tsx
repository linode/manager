import {
  NEWCreateNodeBalancerConfigPayload,
  NodeBalancerConfig
} from 'linode-js-sdk/lib/nodebalancers';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ExpansionPanel from 'src/components/ExpansionPanel';

import withNodeBalancerConfigs, {
  DispatchProps,
  StateProps as ConfigStateProps
} from 'src/containers/__new__/nodeBalancerConfigs.container';

import { getAllNodeBalancerConfigNodes as _getAllNodes } from 'src/store/nodeBalancerConfigNodes/configNode.requests';

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

type CombinedProps = Props &
  DispatchProps &
  ReduxStateProps & {
    getAllNodeBalancerConfigNodes: (configID: number) => Promise<any>;
  };

const EditNodeBalancerConfigs: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [newConfigs, setNewConfigs] = React.useState<
    NEWCreateNodeBalancerConfigPayload[]
  >([]);

  const {
    nodeBalancerLabel,
    // nodeBalancerRegion,
    getAllNodeBalancerConfigNodes,
    configs
  } = props;

  React.useEffect(() => {
    /**
     * iterate over all this NodeBalancer's Configs and request
     * all the nodes for each Config.
     *
     * Do it on every mount
     */
    configs.forEach(eachConfig => {
      getAllNodeBalancerConfigNodes(+eachConfig.id);
    });
  }, []);

  const hasNoConfigs = !Object.keys(configs).length;

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`${nodeBalancerLabel} - Configurations`} />
      <Typography variant="h1" data-qa-title className={classes.title}>
        NodeBalancer Configurations
      </Typography>
      {/** create an expansion panel for each existing config */
      configs.map(eachConfig => {
        return (
          <ExpansionPanel
            key={`config-${eachConfig.id}`}
            heading="hello world"
          />
        );
      })}
      {/** create an expansion panel for each new config */
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

interface ReduxStateProps
  extends Omit<ConfigStateProps, 'nodeBalancerConfigsData'> {
  configs: NodeBalancerConfig[];
}

export default compose<CombinedProps, Props>(
  React.memo,
  withNodeBalancerConfigs<ReduxStateProps, Props>(
    (ownProps, { nodeBalancerConfigsData, ...rest }) => ({
      configs: Object.values(nodeBalancerConfigsData).filter(
        config => config.nodebalancer_id === ownProps.nodeBalancerID
      ),
      ...rest
    })
  ),
  connect(
    undefined,
    (dispatch: any, ownProps: Props) => ({
      getAllNodeBalancerConfigNodes: (configID: number) =>
        dispatch(
          _getAllNodes({
            configID,
            nodeBalancerID: ownProps.nodeBalancerID
          })
        )
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
