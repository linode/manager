import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
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

import ActiveConnections from './ActiveConnections';
import ListeningServices from './ListeningServices';

import { systemInfo } from 'src/__data__/longview';
import {
  LongviewPortsResponse,
  LongviewTopProcesses
} from 'src/features/Longview/request.types';

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
  client: string;
  topProcessesData: LongviewTopProcesses;
  topProcessesLoading: boolean;
  topProcessesError?: APIError[];
  lastUpdatedError?: APIError[];
  listeningPortsLoading: boolean;
  listeningPortsError?: APIError[];
  listeningPortsData: LongviewPortsResponse;
  // systemInfo: LVDataProps['longviewClientData'];
}

export type CombinedProps = RouteComponentProps<{ id: string }> & Props;

export const LongviewDetailOverview: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    listeningPortsData,
    listeningPortsError,
    listeningPortsLoading,
    topProcessesData,
    topProcessesLoading,
    topProcessesError,
    lastUpdatedError
  } = props;

  const url = pathOr('', ['match', 'url'], props);

  const hostname = pathOr(
    'Hostname not available',
    ['SysInfo', 'hostname'],
    systemInfo
  );

  const osDist = pathOr(
    'Distro not available',
    ['SysInfo', 'os', 'dist'],
    systemInfo
  );

  const osDistVersion = pathOr(
    'Distro version not available',
    ['SysInfo', 'os', 'distversion'],
    systemInfo
  );

  const kernel = pathOr(
    'Kernel not available',
    ['SysInfo', 'kernel'],
    systemInfo
  );

  const cpuType = pathOr(
    'CPU type not available',
    ['SysInfo', 'cpu', 'type'],
    systemInfo
  );

  const cpuCoreCount = systemInfo.SysInfo.cpu.cores;

  const coreCountDisplay = cpuCoreCount > 1 ? `Cores` : `Core`;

  /**
   * Show an error for the services/connections
   * tables if the request errors, or if there is
   * a lastUpdated error (which will happen in the
   * event of a network error)
   */
  const _hasError = listeningPortsError || lastUpdatedError;
  const portsError = pathOr<string>(
    'Error retrieving data',
    [0, 'reason'],
    _hasError
  );

  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paperSection}>
            <Grid container justify="space-between" item xs={12} spacing={0}>
              <Grid item xs={12} md={4} lg={3}>
                <Grid
                  container
                  item
                  wrap="nowrap"
                  alignItems="flex-start"
                  className={classes.iconSection}
                >
                  <Grid item>
                    <EntityIcon variant="linode" marginTop={1} />
                  </Grid>
                  <Grid item>
                    <Typography variant="h3" className={classes.wrapHeader}>
                      {props.client}
                    </Typography>
                    <Typography>{hostname}</Typography>
                    <Typography>Up 47d 19h 22m</Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  wrap="nowrap"
                  alignItems="flex-start"
                  className={classes.iconSection}
                >
                  <Grid item>
                    <ServerIcon />
                  </Grid>
                  <Grid item>
                    <Typography>
                      {`${osDist} ${osDistVersion}`}
                      {`(${kernel})`}
                    </Typography>
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
                    <Typography>{cpuType}</Typography>
                    {cpuCoreCount && (
                      <Typography>
                        {`${cpuCoreCount} ${coreCountDisplay}`}
                      </Typography>
                    )}
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

              <Grid item xs={12} md={4} lg={6}>
                Gauges
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
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
                {/* @todo: Replace with real component. */}
                {topProcessesLoading && <div>Loading...</div>}
                {(lastUpdatedError || topProcessesError) && <div>Error!</div>}
                {Object.keys(topProcessesData.Processes).length > 0 && (
                  <pre>
                    {JSON.stringify(props.topProcessesData.Processes, null, 2)}
                  </pre>
                )}
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
        <Grid container justify="space-between" item spacing={0}>
          <ListeningServices
            services={listeningPortsData.Ports.listening}
            servicesLoading={listeningPortsLoading}
            servicesError={portsError}
          />
          <ActiveConnections
            connections={listeningPortsData.Ports.active}
            connectionsLoading={listeningPortsLoading}
            connectionsError={portsError}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default compose<
  CombinedProps,
  Props & RouteComponentProps<{ id: string }>
>(React.memo)(LongviewDetailOverview);
