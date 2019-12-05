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
import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
import { formatUptime } from 'src/utilities/formatUptime';
import { readableBytes } from 'src/utilities/unitConversions';

import { Props as LVDataProps } from 'src/containers/longview.stats.container';
import { LongviewPackage } from '../../request.types';
import {
  getPackageNoticeText,
  getTotalSomething,
  sumStorage
} from '../../shared/utilities';

const useStyles = makeStyles((theme: Theme) => ({
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  wrapHeader: {
    wordBreak: 'break-all'
  },
  headerSection: {
    marginBottom: theme.spacing(3) - 2
  },
  iconSection: {
    marginBottom: theme.spacing(2) - 2,
    '&:last-of-type': {
      marginBottom: 0
    }
  },
  packageButton: {
    marginLeft: -theme.spacing(3) / 2,
    fontSize: '0.875rem',
    padding: `0 ${theme.spacing(1) + 8}px`,
    '& g': {
      stroke: theme.palette.primary.main
    }
  },
  packageStaticOuter: {
    display: 'flex',
    alignItems: 'center'
  },
  packageStaticIcon: {
    marginRight: theme.spacing(1)
  },
  iconItem: {
    alignSelf: 'center',
    marginLeft: -8,
    '& svg': {
      display: 'block',
      margin: '0 auto'
    }
  },
  iconItemLast: {
    alignSelf: 'center',
    marginLeft: -8
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
    'Distro information not available',
    ['SysInfo', 'os', 'dist'],
    props.longviewClientData
  );

  const osDistVersion = pathOr(
    '',
    ['SysInfo', 'os', 'distversion'],
    props.longviewClientData
  );

  const kernel = pathOr('', ['SysInfo', 'kernel'], props.longviewClientData);

  const cpuType = pathOr(
    'CPU information not available',
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

  const convertedTotalMemory = getTotalSomething(usedMemory, freeMemory);
  const convertedTotalSwap = getTotalSomething(usedSwap, freeSwap);

  const storageInBytes = sumStorage(props.longviewClientData.Disk);

  return (
    <Grid item xs={12} md={6} lg={3}>
      <Grid
        container
        item
        wrap="nowrap"
        alignItems="flex-start"
        className={classes.headerSection}
      >
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
        <Grid item xs={2} sm={1} md={2} className={classes.iconItem}>
          <ServerIcon />
        </Grid>
        <Grid item xs={10}>
          <Typography>
            {osDist} {osDistVersion} {kernel && `(${kernel})`}
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
        <Grid item xs={2} sm={1} md={2} className={classes.iconItem}>
          <CPUIcon />
        </Grid>
        <Grid item xs={10}>
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
        <Grid item xs={2} sm={1} md={2} className={classes.iconItem}>
          <RamIcon />
        </Grid>
        {convertedTotalMemory.value !== 0 && convertedTotalSwap.value !== 0 ? (
          <Grid item xs={10}>
            <Typography>
              {`${convertedTotalMemory.value} ${convertedTotalMemory.unit} RAM`}
            </Typography>
            <Typography>
              {`${convertedTotalSwap.value} ${convertedTotalSwap.unit} Swap`}
            </Typography>
          </Grid>
        ) : (
          <Grid item>
            <Typography>RAM information not available</Typography>
          </Grid>
        )}
      </Grid>
      <Grid
        container
        item
        wrap="nowrap"
        alignItems="center"
        className={classes.iconSection}
      >
        <Grid item xs={2} sm={1} md={2} className={classes.iconItem}>
          <DiskIcon />
        </Grid>

        {storageInBytes.total !== 0 ? (
          <Grid item xs={10}>
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
        ) : (
          <Grid item xs={10}>
            <Typography>Storage information not available</Typography>
          </Grid>
        )}
      </Grid>
      <Grid
        container
        item
        wrap="nowrap"
        alignItems="center"
        className={classes.iconSection}
      >
        <Grid item xs={2} sm={1} md={2} className={classes.iconItemLast}>
          {packages && packages.length > 0 ? (
            <IconTextLink
              className={classes.packageButton}
              SideIcon={PackageIcon}
              text={packagesToUpdate}
              title={packagesToUpdate}
              onClick={() => window.open('#')}
            >
              {packagesToUpdate}
            </IconTextLink>
          ) : (
            <div className={classes.packageStaticOuter}>
              <PackageIcon className={classes.packageStaticIcon} />
              <Typography>{packagesToUpdate}</Typography>
            </div>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default compose<Props, Props>(React.memo)(IconSection);
