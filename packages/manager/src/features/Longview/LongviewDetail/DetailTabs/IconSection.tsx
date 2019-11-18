import { pathOr } from 'ramda';
import * as React from 'react';

import CPUIcon from 'src/assets/icons/longview/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/longview/disk.svg';
import PackageIcon from 'src/assets/icons/longview/package-icon.svg';
import RamIcon from 'src/assets/icons/longview/ram-sticks.svg';
import ServerIcon from 'src/assets/icons/longview/server-icon.svg';

import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';

import withClientStats, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';

const useStyles = makeStyles((theme: Theme) => ({
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
  clientID: number;
  clientData: LVDataProps['longviewClientData'];
}

const IconSection: React.FC<Props & LVDataProps> = props => {
  const classes = useStyles();

  const hostname = pathOr(
    'Hostname not available',
    ['SysInfo', 'hostname'],
    props.clientData
  );

  const osDist = pathOr(
    'Distro info not available',
    ['SysInfo', 'os', 'dist'],
    props.clientData
  );

  const osDistVersion = pathOr(
    '',
    ['SysInfo', 'os', 'distversion'],
    props.clientData
  );

  const kernel = pathOr(
    'Kernel not available',
    ['SysInfo', 'kernel'],
    props.clientData
  );

  const cpuType = pathOr(
    'CPU info not available',
    ['SysInfo', 'cpu', 'type'],
    props.clientData
  );

  // const cpuCoreCount = props.clientData.SysInfo.cpu.cores;

  // const coreCountDisplay = cpuCoreCount > 1 ? `Cores` : `Core`;

  return (
    <Grid item xs={12} md={4} lg={3}>
      <Grid
        container
        item
        wrap="nowrap"
        alignItems="flex-start"
        className={classes.iconSection}
      >
        <Grid item>
          <EntityIcon variant="linode" status={status} marginTop={1} />
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
          {/* {cpuCoreCount && (
            <Typography>{`${cpuCoreCount} ${coreCountDisplay}`}</Typography>
          )} */}
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
  );
};

export default withClientStats<LVDataProps & Props>(props => props.clientID)(
  IconSection
);
