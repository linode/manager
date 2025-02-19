import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import CPUIcon from 'src/assets/icons/longview/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/longview/disk.svg';
import PackageIcon from 'src/assets/icons/longview/package-icon.svg';
import RamIcon from 'src/assets/icons/longview/ram-sticks.svg';
import ServerIcon from 'src/assets/icons/longview/server-icon.svg';
import { formatUptime } from 'src/utilities/formatUptime';
import { readableBytes } from 'src/utilities/unitConversions';

import {
  getPackageNoticeText,
  getTotalMemoryUsage,
  sumStorage,
} from '../../shared/utilities';
import {
  StyledHeaderGrid,
  StyledIconContainerGrid,
  StyledIconGrid,
  StyledIconTextLink,
  StyledPackageGrid,
} from './IconSection.styles';

import type { Props as LVDataProps } from 'src/containers/longview.stats.container';

interface Props {
  client: string;
  longviewClientData: LVDataProps['longviewClientData'];
  openPackageDrawer: () => void;
}

export const IconSection = React.memo((props: Props) => {
  const hostname =
    props.longviewClientData?.SysInfo?.hostname ?? 'Hostname not available';

  const osDist =
    props.longviewClientData?.SysInfo?.os?.dist ??
    'Distro information not available';

  const osDistVersion =
    props.longviewClientData?.SysInfo?.os?.distversion ?? '';

  const kernel = props.longviewClientData?.SysInfo?.kernel ?? '';

  const cpuType =
    props.longviewClientData?.SysInfo?.cpu?.type ??
    'CPU information not available';

  const uptime = props.longviewClientData?.uptime ?? null;
  const formattedUptime =
    uptime !== null ? `Up ${formatUptime(uptime)}` : 'Uptime not available';

  const cpuCoreCount = props.longviewClientData?.SysInfo?.cpu?.cores ?? '';

  const coreCountDisplay = cpuCoreCount && cpuCoreCount > 1 ? `Cores` : `Core`;

  const packages = props.longviewClientData?.Packages ?? null;

  const packagesToUpdate = getPackageNoticeText(packages);

  const usedMemory = props.longviewClientData?.Memory?.real?.used?.[0]?.y ?? 0;
  const freeMemory = props.longviewClientData?.Memory?.real?.free?.[0]?.y ?? 0;

  const freeSwap = props.longviewClientData?.Memory?.swap?.free?.[0]?.y ?? 0;
  const usedSwap = props.longviewClientData?.Memory?.swap?.used?.[0]?.y ?? 0;

  const convertedTotalMemory = getTotalMemoryUsage(usedMemory, freeMemory);
  const convertedTotalSwap = getTotalMemoryUsage(usedSwap, freeSwap);

  const storageInBytes = sumStorage(props.longviewClientData.Disk);

  return (
    (<Grid
      size={{
        lg: 3,
        md: 6,
        xs: 12
      }}>
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
        <StyledIconGrid size={{ md: 2, sm: 1, xs: 2 }}>
          <ServerIcon />
        </StyledIconGrid>
        <Grid size={10}>
          <Typography>
            {osDist} {osDistVersion} {kernel && `(${kernel})`}
          </Typography>
        </Grid>
      </StyledIconContainerGrid>
      <StyledIconContainerGrid container spacing={2}>
        <StyledIconGrid size={{ md: 2, sm: 1, xs: 2 }}>
          <CPUIcon />
        </StyledIconGrid>
        <Grid size={10}>
          <Typography>{cpuType}</Typography>
          {cpuCoreCount && (
            <Typography>{`${cpuCoreCount} ${coreCountDisplay}`}</Typography>
          )}
        </Grid>
      </StyledIconContainerGrid>
      <StyledIconContainerGrid container spacing={2}>
        <StyledIconGrid size={{ md: 2, sm: 1, xs: 2}}>
          <RamIcon />
        </StyledIconGrid>
        {convertedTotalMemory.value !== 0 && convertedTotalSwap.value !== 0 ? (
          <Grid size={10}>
            <Typography>
              {`${convertedTotalMemory.value} ${convertedTotalMemory.unit} RAM`}
            </Typography>
            <Typography>
              {`${convertedTotalSwap.value} ${convertedTotalSwap.unit} Swap`}
            </Typography>
          </Grid>
        ) : (
          <Grid size={10}>
            <Typography>RAM information not available</Typography>
          </Grid>
        )}
      </StyledIconContainerGrid>
      <StyledIconContainerGrid container spacing={2}>
        <StyledIconGrid size={{ md: 2, sm: 1, xs: 2}}>
          <DiskIcon />
        </StyledIconGrid>

        {storageInBytes.total !== 0 ? (
          <Grid size={10}>
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
          <Grid size={10}>
            <Typography>Storage information not available</Typography>
          </Grid>
        )}
      </StyledIconContainerGrid>
      {packages && packages.length > 0 ? (
        <StyledIconContainerGrid container spacing={2}>
          <StyledPackageGrid size={{ md: 2, sm: 1, xs: 2 }}>
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
          <StyledIconGrid size={{ md: 2, sm: 1, xs: 2 }}>
            <PackageIcon />
          </StyledIconGrid>
          <Grid size={10}>
            <Typography>{packagesToUpdate}</Typography>
          </Grid>
        </StyledIconContainerGrid>
      )}
    </Grid>)
  );
});
