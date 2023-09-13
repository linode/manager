import { pathOr } from 'ramda';
import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

import CPUIcon from 'src/assets/icons/longview/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/longview/disk.svg';
import PackageIcon from 'src/assets/icons/longview/package-icon.svg';
import RamIcon from 'src/assets/icons/longview/ram-sticks.svg';
import ServerIcon from 'src/assets/icons/longview/server-icon.svg';
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
import {
  StyledHeaderGrid,
  StyledIconGrid,
  StyledIconContainerGrid,
  StyledIconTextLink,
  StyledPackageGrid,
} from './IconSection.styles';

interface Props {
  client: string;
  longviewClientData: LVDataProps['longviewClientData'];
  openPackageDrawer: () => void;
}

export const IconSection = React.memo((props: Props) => {
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
    <Grid lg={3} md={6} xs={12}>
      <StyledHeaderGrid container spacing={2}>
        <Grid>
          <Typography sx={{ wordBreak: 'break-all' }} variant="h3">
            {props.client}
          </Typography>
          <Typography>{hostname}</Typography>
          <Typography>{formattedUptime}</Typography>
        </Grid>
      </StyledHeaderGrid>
      <StyledIconContainerGrid container spacing={2}>
        <StyledIconGrid md={2} sm={1} xs={2}>
          <ServerIcon />
        </StyledIconGrid>
        <Grid xs={10}>
          <Typography>
            {osDist} {osDistVersion} {kernel && `(${kernel})`}
          </Typography>
        </Grid>
      </StyledIconContainerGrid>
      <StyledIconContainerGrid container spacing={2}>
        <StyledIconGrid md={2} sm={1} xs={2}>
          <CPUIcon />
        </StyledIconGrid>
        <Grid xs={10}>
          <Typography>{cpuType}</Typography>
          {cpuCoreCount && (
            <Typography>{`${cpuCoreCount} ${coreCountDisplay}`}</Typography>
          )}
        </Grid>
      </StyledIconContainerGrid>
      <StyledIconContainerGrid container spacing={2}>
        <StyledIconGrid md={2} sm={1} xs={2}>
          <RamIcon />
        </StyledIconGrid>
        {convertedTotalMemory.value !== 0 && convertedTotalSwap.value !== 0 ? (
          <Grid xs={10}>
            <Typography>
              {`${convertedTotalMemory.value} ${convertedTotalMemory.unit} RAM`}
            </Typography>
            <Typography>
              {`${convertedTotalSwap.value} ${convertedTotalSwap.unit} Swap`}
            </Typography>
          </Grid>
        ) : (
          <Grid xs={10}>
            <Typography>RAM information not available</Typography>
          </Grid>
        )}
      </StyledIconContainerGrid>
      <StyledIconContainerGrid container spacing={2}>
        <StyledIconGrid md={2} sm={1} xs={2}>
          <DiskIcon />
        </StyledIconGrid>

        {storageInBytes.total !== 0 ? (
          <Grid xs={10}>
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
          <Grid xs={10}>
            <Typography>Storage information not available</Typography>
          </Grid>
        )}
      </StyledIconContainerGrid>
      {packages && packages.length > 0 ? (
        <StyledIconContainerGrid container spacing={2}>
          <StyledPackageGrid md={2} sm={1} xs={2}>
            <StyledIconTextLink
              SideIcon={PackageIcon}
              onClick={props.openPackageDrawer}
              text={packagesToUpdate}
              title={packagesToUpdate}
            >
              {packagesToUpdate}
            </StyledIconTextLink>
          </StyledPackageGrid>
        </StyledIconContainerGrid>
      ) : (
        <StyledIconContainerGrid container spacing={2}>
          <StyledIconGrid md={2} sm={1} xs={2}>
            <PackageIcon />
          </StyledIconGrid>
          <Grid xs={10}>
            <Typography>{packagesToUpdate}</Typography>
          </Grid>
        </StyledIconContainerGrid>
      )}
    </Grid>
  );
});
