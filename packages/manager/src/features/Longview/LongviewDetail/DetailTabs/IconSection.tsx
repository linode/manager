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

import { pluralize } from 'src/utilities/pluralize';
import { LongviewPackage } from '../../request.types';

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
}

const IconSection: React.FC<Props & LVDataProps> = props => {
  const { longviewClientData } = props;

  const classes = useStyles();

  const hostname = pathOr(
    'Hostname not available',
    ['hostname'],
    longviewClientData.SysInfo
  );

  const osDist = pathOr(
    'Distro info not available',
    ['os', 'dist'],
    longviewClientData.SysInfo
  );

  const osDistVersion = pathOr(
    '',
    ['os', 'distversion'],
    longviewClientData.SysInfo
  );

  const kernel = pathOr(
    'Kernel not available',
    ['kernel'],
    longviewClientData.SysInfo
  );

  const cpuType = pathOr(
    'CPU info not available',
    ['cpu', 'type'],
    longviewClientData.SysInfo
  );

  const cpuCoreCount =
    longviewClientData.SysInfo && longviewClientData.SysInfo.cpu.cores;

  const coreCountDisplay = cpuCoreCount && cpuCoreCount > 1 ? `Cores` : `Core`;

  const packages = pathOr<LongviewPackage[] | null>(
    null,
    ['Packages'],
    longviewClientData
  );

  const getPackageNoticeText = (packages: LongviewPackage[]) => {
    if (!packages) {
      return 'Package information not available';
    }
    if (packages.length === 0) {
      return 'All packages up to date';
    }
    return `${pluralize('update', 'updates', packages.length)} Available`;
  };

  const packagesToUpdate = getPackageNoticeText(packages);

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
          {/* TODO make this real */}
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
          <Typography>{`${osDist} ${osDistVersion} (${kernel})`}</Typography>
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
            <Typography>{`${cpuCoreCount} ${coreCountDisplay}`}</Typography>
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
          {/* TODO make this real */}
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
          {/* TODO make this real */}
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
            {packagesToUpdate}
            {packages && packages.length > 0 && (
              <HelpIcon
                className={classes.toolTip}
                text={`Time to upgrade!`}
                tooltipPosition="right"
              />
            )}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default withClientStats<LVDataProps & Props>(props => props.clientID)(
  IconSection
);
