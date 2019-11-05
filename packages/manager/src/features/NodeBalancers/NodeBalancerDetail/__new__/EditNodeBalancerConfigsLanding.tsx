import { NEWCreateNodeBalancerConfigPayload } from 'linode-js-sdk/lib/nodebalancers';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ExpansionPanel from 'src/components/ExpansionPanel';

import withNodeBalancerConfigs, {
  Props as ConfigProps,
  StateProps as ConfigStateProps
} from 'src/containers/__new__/nodeBalancerConfigs.container';

import { getAllNodeBalancerConfigNodes } from 'src/store/nodeBalancerConfigNodes/configNode.requests';

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
  ConfigProps & {
    getAllNodeBalancerConfigNodes: (configID: number) => Promise<any>;
  };

const EditNodeBalancerConfigs: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [newConfigs, setNewConfigs] = React.useState<
    NEWCreateNodeBalancerConfigPayload[]
  >([]);

  React.useEffect(() => {
    /**
     * iterate over all this NodeBalancer's Configs and request
     * all the nodes for each Config.
     *
     * Do it on every mount
     */
    Object.keys(nodeBalancerConfigsData).forEach(eachKey => {
      props.getAllNodeBalancerConfigNodes(+eachKey);
    });
  }, []);

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
      {/** create an expansion panel for each existing config */
      Object.keys(nodeBalancerConfigsData).map(eachKey => {
        return (
          <ExpansionPanel key={`config-${eachKey}`} heading="hello world" />
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

export default compose<CombinedProps, Props>(
  React.memo,
  withNodeBalancerConfigs<ConfigStateProps, Props>(
    (ownProps, { nodeBalancerConfigsData, ...rest }) => ({
      nodeBalancerConfigsData: Object.values(nodeBalancerConfigsData).reduce(
        (acc, eachConfig) => {
          /** return us just the configs that are attached to this nodebalancer */
          if (eachConfig.nodebalancer_id === ownProps.nodeBalancerID) {
            acc[eachConfig.id] = nodeBalancerConfigsData[eachConfig.id];
          }

          return acc;
        },
        {}
      ),
      ...rest
    })
  ),
  connect(
    undefined,
    (dispatch: any, ownProps: Props) => ({
      getAllNodeBalancerConfigNodes: (configID: number) =>
        dispatch(
          getAllNodeBalancerConfigNodes({
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
