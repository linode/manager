import { Typography, clamp } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import withClientStats from 'src/containers/longview.stats.container';

import { baseGaugeProps } from './common';

import type { CPU } from '../../request.types';
import type { BaseProps as Props } from './common';
import type { Props as LVDataProps } from 'src/containers/longview.stats.container';

interface getFinalUsedCPUProps extends Props, LVDataProps {}

export const getFinalUsedCPU = (data: LVDataProps['longviewClientData']) => {
  const numberOfCores = data?.SysInfo?.cpu?.cores ?? 0;
  const usedCPU = sumCPUUsage(data.CPU);
  return normalizeValue(usedCPU, numberOfCores);
};

export const CPUGauge = withClientStats<Props>((ownProps) => ownProps.clientID)(
  (props: getFinalUsedCPUProps) => {
    const {
      lastUpdatedError,
      longviewClientData,
      longviewClientDataError: error,
      longviewClientDataLoading: loading,
    } = props;

    const theme = useTheme();

    const numberOfCores = longviewClientData?.SysInfo?.cpu?.cores ?? 0;
    const usedCPU = sumCPUUsage(longviewClientData.CPU);
    const finalUsedCPU = normalizeValue(usedCPU, numberOfCores);

    return (
      <GaugePercent
        {...baseGaugeProps}
        // The MAX depends on the number of CPU cores. Default to 1 if cores
        innerText={innerText(
          finalUsedCPU || 0,
          loading,
          !!error || !!lastUpdatedError
        )}
        subTitle={
          <>
            <Typography>
              <strong>CPU</strong>
            </Typography>
            {!error && !loading && (
              <Typography>
                {pluralize('Core', 'Cores', numberOfCores || 0)}
              </Typography>
            )}
          </>
        }
        filledInColor={theme.graphs.blue}
        // doesn't exist or is 0.
        max={100 * numberOfCores}
        value={usedCPU}
      />
    );
  }
);

// UTILITIES
export const sumCPUUsage = (CPUData: Record<string, CPU> = {}) => {
  let sum = 0;
  Object.keys(CPUData).forEach((key) => {
    const cpu = CPUData[key];
    Object.keys(cpu).forEach((entry) => {
      const val = cpu?.[entry as keyof CPU]?.[0]?.y ?? 0;
      sum += val;
    });
  });
  return sum;
};

export const normalizeValue = (value: number, numCores: number) => {
  // Clamp with throw if `max` is less than `min` and as of Aug 17th, 2023,
  // the Longview service allows users to have a negative number of cores.
  if (numCores < 0) {
    return 0;
  }
  const clamped = clamp(0, 100 * numCores, value);
  return Math.round(clamped);
};

export const innerText = (value: number, loading: boolean, error: boolean) => {
  if (error) {
    return 'Error';
  }

  if (loading) {
    return 'Loading...';
  }

  return `${value}%`;
};
