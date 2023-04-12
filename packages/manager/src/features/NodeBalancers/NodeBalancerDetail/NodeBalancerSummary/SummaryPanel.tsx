import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { TagsPanel } from 'src/components/TagsPanel';
import summaryPanelStyles from 'src/containers/SummaryPanels.styles';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { Link, useParams } from 'react-router-dom';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useRegionsQuery } from 'src/queries/regions';
import {
  useAllNodeBalancerConfigsQuery,
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
} from 'src/queries/nodebalancers';

const useStyles = makeStyles((theme: Theme) => ({
  ...summaryPanelStyles(theme),
  root: {
    paddingTop: theme.spacing(),
  },
  NBsummarySection: {
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(6),
    },
  },
  IPgrouping: {
    margin: '-2px 0 0 2px',
    display: 'flex',
    flexDirection: 'column',
  },
  nodeTransfer: {
    marginTop: 12,
  },
  hostName: {
    wordBreak: 'break-word',
  },
}));

const SummaryPanel = () => {
  const classes = useStyles();
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const { data: nodebalancer } = useNodeBalancerQuery(id);
  const { data: configs } = useAllNodeBalancerConfigsQuery(id);
  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r) => r.id === nodebalancer?.region);

  const { mutateAsync: updateNodeBalancer } = useNodebalancerUpdateMutation(id);

  const configPorts = configs?.reduce((acc, config) => {
    return [...acc, { configId: config.id, port: config.port }];
  }, []);

  const down = configs?.reduce((acc: number, config) => {
    return acc + config.nodes_status.down;
  }, 0); // add the downtime for each config together

  const up = configs?.reduce((acc: number, config) => {
    return acc + config.nodes_status.up;
  }, 0); // add the uptime for each config together

  if (!nodebalancer || !configs) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Paper
        className={`${classes.summarySection} ${classes.NBsummarySection}`}
      >
        <Typography variant="h3" className={classes.title} data-qa-title>
          NodeBalancer Details
        </Typography>
        <div className={classes.section}>
          <Typography variant="body1" data-qa-ports>
            <strong>Ports: </strong>
            {configPorts?.length === 0 && 'None'}
            {configPorts?.map(({ port, configId }, i) => (
              <React.Fragment key={configId}>
                <Link
                  to={`/nodebalancers/${nodebalancer?.id}/configurations/${configId}`}
                  className="secondaryLink"
                >
                  {port}
                </Link>
                {i < configPorts?.length - 1 ? ', ' : ''}
              </React.Fragment>
            ))}
          </Typography>
        </div>
        <div className={classes.section}>
          <Typography variant="body1">
            <strong>Backend Status: </strong>
            {`${up} up, ${down} down`}
          </Typography>
        </div>
        <div className={classes.section}>
          <Typography variant="body1">
            <strong>Transferred: </strong>
            {convertMegabytesTo(nodebalancer.transfer.total)}
          </Typography>
        </div>
        <div className={classes.section}>
          <Typography variant="body1" className={classes.hostName}>
            <strong>Host Name: </strong>
            {nodebalancer.hostname}
          </Typography>
        </div>
        <div className={classes.section}>
          <Typography variant="body1" data-qa-region>
            <strong>Region:</strong> {region?.label}
          </Typography>
        </div>
      </Paper>
      <Paper className={classes.summarySection}>
        <Typography variant="h3" className={classes.title} data-qa-title>
          IP Addresses
        </Typography>
        <div className={`${classes.section}`}>
          <div className={classes.IPgrouping} data-qa-ip>
            {nodebalancer?.ipv4 && (
              <IPAddress ips={[nodebalancer?.ipv4]} showMore />
            )}
            {nodebalancer?.ipv6 && <IPAddress ips={[nodebalancer?.ipv6]} />}
          </div>
        </div>
      </Paper>

      <Paper className={classes.summarySection}>
        <Typography variant="h3" className={classes.title} data-qa-title>
          Tags
        </Typography>
        <TagsPanel
          tags={nodebalancer?.tags}
          updateTags={(tags) => updateNodeBalancer({ tags })}
        />
      </Paper>
    </div>
  );
};

export default SummaryPanel;
