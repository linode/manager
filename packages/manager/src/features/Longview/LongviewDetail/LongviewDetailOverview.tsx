import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import CPUIcon from 'src/assets/icons/longview/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/longview/disk.svg';
import PackageIcon from 'src/assets/icons/longview/package-icon.svg';
import RamIcon from 'src/assets/icons/longview/ram-sticks.svg';
import ServerIcon from 'src/assets/icons/longview/server-icon.svg';

import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
// import Select from 'src/components/EnhancedSelect/Select';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';

import withLongviewClients, {
  Props as LVProps
} from 'src/containers/longview.container';

const useStyles = makeStyles((theme: Theme) => ({
  paperSection: {
    padding: theme.spacing(3) + 1,
    marginBottom: theme.spacing(1) + 3
  },
  detailsLink: {
    fontSize: 16,
    fontWeight: 'bold',
    position: 'relative',
    top: 3
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  wrapHeader: {
    wordBreak: 'break-all'
  },
  iconSection: {
    marginBottom: theme.spacing(2) - 2
  },
  toolTip: {
    padding: theme.spacing(1),
    '& svg': {
      width: 18,
      height: 18,
      position: 'relative',
      top: -2
    }
  }
}));

interface Props {
  clients: LVProps['longviewClientsData'];
  longviewClientsLastUpdated: number;
}

type CombinedProps = RouteComponentProps<{ id: string }> & Props;

interface PartialLongviewProps {
  clients: LVProps['longviewClientsData'];
  longviewClientsLastUpdated: LVProps['longviewClientsLastUpdated'];
}

const LongviewDetailOverview: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    match: {
      params: { id }
    }
  } = props;
  const client = props.clients[id];
  const url = props.match.url;

  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paperSection}>
            <Grid container justify="space-between" item xs={12} spacing={0}>
              <Grid item xs={12} md={3}>
                <Grid
                  container
                  item
                  wrap="nowrap"
                  alignItems="flex-start"
                  className={classes.iconSection}
                >
                  <Grid item>
                    <EntityIcon
                      variant="linode"
                      status={status}
                      marginTop={1}
                    />
                  </Grid>
                  <Grid item>
                    <Typography variant="h3" className={classes.wrapHeader}>
                      {client.label}
                    </Typography>
                    <Typography>dev.hostname.com</Typography>
                    <Typography>Up 47d 19h 22m</Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  wrap="nowrap"
                  alignItems="center"
                  className={classes.iconSection}
                >
                  <Grid item>
                    <ServerIcon />
                  </Grid>
                  <Grid item>
                    <Typography>Debian 9.9 (Linux 4.9.0-9-amd64)</Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  wrap="nowrap"
                  alignItems="center"
                  className={classes.iconSection}
                >
                  <Grid item>
                    <CPUIcon />
                  </Grid>
                  <Grid item>
                    <Typography>AMD EPYC 7501 32-Core Processor</Typography>
                    <Typography>1 Core</Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  wrap="nowrap"
                  alignItems="center"
                  className={classes.iconSection}
                >
                  <Grid item>
                    <RamIcon />
                  </Grid>
                  <Grid item>
                    <Typography>1 GB RAM</Typography>
                    <Typography>512 MB Swap</Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  wrap="nowrap"
                  alignItems="center"
                  className={classes.iconSection}
                >
                  <Grid item>
                    <DiskIcon />
                  </Grid>
                  <Grid item>
                    <Typography>2000 GB Storage</Typography>
                    <Typography>500 GB Available</Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  wrap="nowrap"
                  alignItems="center"
                  className={classes.iconSection}
                >
                  <Grid item>
                    <PackageIcon />
                  </Grid>
                  <Grid item>
                    <Typography>
                      6 Package Updates Available{' '}
                      <HelpIcon
                        className={classes.toolTip}
                        text={`Time to upgrade!`}
                        tooltipPosition="right"
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                Gauges
              </Grid>
              <Grid item xs={12} md={3}>
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <Typography variant="h2">Top Processes</Typography>
                  <Link to={`${url}/processes`} className={classes.detailsLink}>
                    View Details
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid
          container
          alignItems="flex-end"
          justify="space-between"
          item
          xs={12}
          spacing={0}
        >
          <Grid item>
            <Typography variant="h2">Resource Allocation History</Typography>
          </Grid>
          <Grid item>
            {/* TODO make this functional
              <Select
                options={rangeSelectOptions}
                defaultValue={rangeSelectOptions[0]}
                onChange={handleChartRangeChange}
                name="chartRange"
                id="chartRange"
                small
                label="Select Time Range"
                hideLabel
                isClearable={false}
                data-qa-item="chartRange"
              />
              */}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paperSection}>Graphs here</Paper>
        </Grid>
        <Grid container item xs={12}>
          <Grid item xs={12} md={8}>
            <Typography variant="h2">Listening Services</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h2">Active Connections</Typography>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withLongviewClients<PartialLongviewProps, {}>(
    (own, { longviewClientsData, longviewClientsLastUpdated }) => ({
      clients: longviewClientsData,
      longviewClientsLastUpdated
    })
  )
)(LongviewDetailOverview);
