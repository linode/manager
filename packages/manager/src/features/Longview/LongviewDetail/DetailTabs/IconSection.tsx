import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
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
import { formatUptime } from 'src/utilities/formatUptime';

import { Props as LVDataProps } from 'src/containers/longview.stats.container';

import { readableBytes } from 'src/utilities/unitConversions';
import { LongviewPackage } from '../../request.types';
import { getPackageNoticeText } from '../../LongviewLanding/LongviewClientHeader';

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
  longviewClientData: LVDataProps['longviewClientData'];
}

const IconSection: React.FC<Props> = props => {
  const classes = useStyles();
  const { longviewClientData } = props;

  const hostname = pathOr(
    'Hostname not available',
    ['hostname'],
    props.longviewClientData.SysInfo
  );

  const osDist = pathOr(
    'Distro info not available',
    ['os', 'dist'],
    props.longviewClientData.SysInfo
  );

  const osDistVersion = pathOr(
    '',
    ['os', 'distversion'],
    props.longviewClientData.SysInfo
  );

  const kernel = pathOr(
    'Kernel not available',
    ['kernel'],
    props.longviewClientData.SysInfo
  );

  const cpuType = pathOr(
    'CPU info not available',
    ['cpu', 'type'],
    props.longviewClientData.SysInfo
  );

  const uptime = pathOr(
    'Uptime not available',
    ['Uptime'],
    props.longviewClientData
  );

  const cpuCoreCount =
    props.longviewClientData.SysInfo &&
    props.longviewClientData.SysInfo.cpu.cores;

  const coreCountDisplay = cpuCoreCount && cpuCoreCount > 1 ? `Cores` : `Core`;

  const packages = pathOr<LongviewPackage[] | null>(
    null,
    ['Packages'],
    props.longviewClientData
  );

  const packagesToUpdate = getPackageNoticeText(packages);

  const usedMemory = pathOr(
    0,
    ['Memory', 'real', 'used', 0, 'y'],
    longviewClientData
  );
  const freeMemory = pathOr(
    0,
    ['Memory', 'real', 'free', 0, 'y'],
    longviewClientData
  );

  const freeSwap = pathOr<number>(
    0,
    ['Memory', 'swap', 'free', 0, 'y'],
    longviewClientData
  );
  const usedSwap = pathOr<number>(
    0,
    ['Memory', 'swap', 'used', 0, 'y'],
    longviewClientData
  );

  const getTotalSomething = (used: number, free: number) => {
    const total = used + free;
    const howManyBytesInGB = 1073741824;
    const memoryToBytes = total * 1024;
    return readableBytes(memoryToBytes, {
      unit: memoryToBytes > howManyBytesInGB ? 'GB' : 'MB'
    });
  };

  // const totalSwap = usedSwap + freeSwap;

  // const totalMemory = usedMemory + freeMemory;

  // const convertedTotalMemory = readableBytes(
  //   /** convert KB to bytes */
  //   totalMemory * 1024,
  //   {
  //     unit: 'GB'
  //   }
  // );

  // const convertedTotalSwap = readableBytes(
  //   /** convert KB to bytes */
  //   totalSwap * 1024,
  //   {
  //     unit: 'MB'
  //   }
  // );

  const convertedTotalMemory = getTotalSomething(usedMemory, freeMemory);
  const convertedTotalSwap = getTotalSomething(usedSwap, freeSwap);

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
          <Typography>Up {formatUptime(uptime)}</Typography>
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
          <Typography>
            {`${convertedTotalMemory.value} ${convertedTotalMemory.unit}`} RAM
          </Typography>
          <Typography>
            {`${convertedTotalSwap.value} ${convertedTotalSwap.unit}`} Swap
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

export default compose<Props, Props>(React.memo)(IconSection);
