import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import CPUIcon from 'src/assets/icons/longview/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/longview/disk.svg';
import PackageIcon from 'src/assets/icons/longview/package-icon.svg';
import RamIcon from 'src/assets/icons/longview/ram-sticks.svg';
import ServerIcon from 'src/assets/icons/longview/server-icon.svg';
import { Grid } from 'src/components/Grid';
import { IconTextLink } from 'src/components/IconTextLink/IconTextLink';
import { Typography } from 'src/components/Typography';
import { Props as LVDataProps } from 'src/containers/longview.stats.container';
import { formatUptime } from 'src/utilities/formatUptime';
import { readableBytes } from 'src/utilities/unitConversions';

import { LongviewPackage } from '../../request.types';
import {
  getPackageNoticeText,
  getTotalMemoryUsage,
  sumStorage,
} from '../../shared/utilities';

const useStyles = makeStyles((theme: Theme) => ({
  headerSection: {
    marginBottom: `calc(${theme.spacing(3)} - 2)`,
  },
  iconItem: {
    '& svg': {
      display: 'block',
      margin: '0 auto',
    },
    alignSelf: 'center',
    marginLeft: 0,
  },
  iconItemLast: {
    alignSelf: 'center',
  },
  iconSection: {
    '&:last-of-type': {
      marginBottom: 0,
    },
    marginBottom: `calc(${theme.spacing(2)} - 2)`,
  },
  packageButton: {
    '& g': {
      stroke: theme.palette.primary.main,
    },
    '& svg': {
      marginRight: 15,
    },
    fontSize: '0.875rem',
    padding: 0,
  },
  packageStaticIcon: {
    marginRight: theme.spacing(1),
  },
  packageStaticOuter: {
    alignItems: 'center',
    display: 'flex',
  },
  wrapHeader: {
    wordBreak: 'break-all',
  },
}));

interface Props {
  client: string;
  longviewClientData: LVDataProps['longviewClientData'];
  openPackageDrawer: () => void;
}

const IconSection: React.FC<Props> = (props) => {
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

  const uptime = pathOr<null | number>(
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

  const convertedTotalMemory = getTotalMemoryUsage(usedMemory, freeMemory);
  const convertedTotalSwap = getTotalMemoryUsage(usedSwap, freeSwap);

  const storageInBytes = sumStorage(props.longviewClientData.Disk);

  return (
    <Grid item lg={3} md={6} xs={12}>
      <Grid
        alignItems="flex-start"
        className={classes.headerSection}
        container
        item
        wrap="nowrap"
      >
        <Grid item>
          <Typography className={classes.wrapHeader} variant="h3">
            {props.client}
          </Typography>
          <Typography>{hostname}</Typography>
          <Typography>{formattedUptime}</Typography>
        </Grid>
      </Grid>
      <Grid
        alignItems="flex-start"
        className={classes.iconSection}
        container
        item
        wrap="nowrap"
      >
        <Grid className={classes.iconItem} item md={2} sm={1} xs={2}>
          <ServerIcon />
        </Grid>
        <Grid item xs={10}>
          <Typography>
            {osDist} {osDistVersion} {kernel && `(${kernel})`}
          </Typography>
        </Grid>
      </Grid>
      <Grid
        alignItems="center"
        className={classes.iconSection}
        container
        item
        wrap="nowrap"
      >
        <Grid className={classes.iconItem} item md={2} sm={1} xs={2}>
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
        alignItems="center"
        className={classes.iconSection}
        container
        item
        wrap="nowrap"
      >
        <Grid className={classes.iconItem} item md={2} sm={1} xs={2}>
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
          <Grid item xs={10}>
            <Typography>RAM information not available</Typography>
          </Grid>
        )}
      </Grid>
      <Grid
        alignItems="center"
        className={classes.iconSection}
        container
        item
        wrap="nowrap"
      >
        <Grid className={classes.iconItem} item md={2} sm={1} xs={2}>
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
        alignItems="center"
        className={classes.iconSection}
        container
        item
        wrap="nowrap"
      >
        {packages && packages.length > 0 ? (
          <Grid className={classes.iconItemLast} item md={2} sm={1} xs={2}>
            <IconTextLink
              SideIcon={PackageIcon}
              className={classes.packageButton}
              onClick={props.openPackageDrawer}
              text={packagesToUpdate}
              title={packagesToUpdate}
            >
              {packagesToUpdate}
            </IconTextLink>
          </Grid>
        ) : (
          <Grid
            alignItems="center"
            className={classes.packageStaticOuter}
            container
            item
            wrap="nowrap"
          >
            <Grid className={classes.iconItem} item md={2} sm={1} xs={2}>
              <PackageIcon className={classes.packageStaticIcon} />
            </Grid>
            <Grid item xs={10}>
              <Typography>{packagesToUpdate}</Typography>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default compose<Props, Props>(React.memo)(IconSection);
