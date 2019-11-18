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
import { readableBytes } from 'src/utilities/unitConversions';

import { Props as LVDataProps } from 'src/containers/longview.stats.container';

import { sumStorage } from '../../LongviewLanding/Gauges/Storage';
import { getPackageNoticeText } from '../../LongviewLanding/LongviewClientHeader';
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
  longviewClientData: LVDataProps['longviewClientData'];
}

const IconSection: React.FC<Props> = props => {
  const classes = useStyles();

  const hostname = pathOr(
    'Hostname not available',
    ['SysInfo', 'hostname'],
    props.longviewClientData
  );

  const osDist = pathOr(
    'Distro info not available',
    ['SysInfo', 'os', 'dist'],
    props.longviewClientData
  );

  const osDistVersion = pathOr(
    '',
    ['SysInfo', 'os', 'distversion'],
    props.longviewClientData
  );

  const kernel = pathOr(
    'Kernel not available',
    ['SysInfo', 'kernel'],
    props.longviewClientData
  );

  const cpuType = pathOr(
    'CPU info not available',
    ['SysInfo', 'cpu', 'type'],
    props.longviewClientData
  );

  const uptime = pathOr<number | null>(
    null,
    ['Uptime'],
    props.longviewClientData
  );

  const formattedUptime =
    uptime !== null ? `Up ${formatUptime(uptime)}` : 'Uptime not available';

  const cpuCoreCount = pathOr(
    '',
    ['SysInfo', 'cpu', 'cores'],
    props.longviewClientData
  );

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
    props.longviewClientData
  );
  const freeMemory = pathOr(
    0,
    ['Memory', 'real', 'free', 0, 'y'],
    props.longviewClientData
  );

  const freeSwap = pathOr<number>(
    0,
    ['Memory', 'swap', 'free', 0, 'y'],
    props.longviewClientData
  );
  const usedSwap = pathOr<number>(
    0,
    ['Memory', 'swap', 'used', 0, 'y'],
    props.longviewClientData
  );

  const getTotalSomething = (used: number, free: number) => {
    const total = used + free;
    const howManyBytesInGB = 1073741824;
    const memoryToBytes = total * 1024;
    return readableBytes(memoryToBytes, {
      unit: memoryToBytes > howManyBytesInGB ? 'GB' : 'MB'
    });
  };

  const convertedTotalMemory = getTotalSomething(usedMemory, freeMemory);
  const convertedTotalSwap = getTotalSomething(usedSwap, freeSwap);

  const storageInBytes = sumStorage(props.longviewClientData.Disk);

  // TODO Remove commented once getTotalSomething is verified
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
          <EntityIcon variant="linode" marginTop={1} />
        </Grid>
        <Grid item>
          <Typography variant="h3" className={classes.wrapHeader}>
            {props.client}
          </Typography>
          <Typography>{hostname}</Typography>
          <Typography>{formattedUptime}</Typography>
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
          <Typography>
            {`${convertedTotalMemory.value} ${convertedTotalMemory.unit} RAM`}
          </Typography>
          <Typography>
            {`${convertedTotalSwap.value} ${convertedTotalSwap.unit} Swap`}
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
          <Typography>
            {`${
              readableBytes(storageInBytes.total, { unit: 'GB' }).formatted
            } Storage`}
          </Typography>
          <Typography>
            {`${
              readableBytes(storageInBytes.free, { unit: 'GB' }).formatted
            } Available`}
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
          <PackageIcon />
        </Grid>
        <Grid item>
          <Typography>
            {packagesToUpdate}
            {/* TODO usage of a tooltip might be changed */}
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
