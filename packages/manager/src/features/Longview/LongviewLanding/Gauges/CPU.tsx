import { WithTheme, withTheme } from '@mui/styles';
import { clamp, pathOr } from 'ramda';
import * as React from 'react';

import GaugePercent from 'src/components/GaugePercent';
import { Typography } from 'src/components/Typography';
import withClientStats, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';
import { pluralize } from 'src/utilities/pluralize';

import { CPU } from '../../request.types';
import { BaseProps as Props, baseGaugeProps } from './common';

type CombinedProps = Props & WithTheme & LVDataProps;

export const getFinalUsedCPU = (data: LVDataProps['longviewClientData']) => {
  const numberOfCores = pathOr(0, ['SysInfo', 'cpu', 'cores'], data);
  const usedCPU = sumCPUUsage(data.CPU);
  return normalizeValue(usedCPU, numberOfCores);
};

const CPUGauge: React.FC<CombinedProps> = (props) => {
  const {
    lastUpdatedError,
    longviewClientData,
    longviewClientDataError: error,
    longviewClientDataLoading: loading,
  } = props;

  const numberOfCores = pathOr(
    0,
    ['SysInfo', 'cpu', 'cores'],
    longviewClientData
  );
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
      filledInColor={props.theme.graphs.blue}
      // doesn't exist or is 0.
      max={100 * numberOfCores}
      value={usedCPU}
    />
  );
};

export default withClientStats<Props>((ownProps) => ownProps.clientID)(
  withTheme(CPUGauge)
);

// UTILITIES
export const sumCPUUsage = (CPUData: Record<string, CPU> = {}) => {
  let sum = 0;
  Object.keys(CPUData).forEach((key) => {
    const cpu = CPUData[key];
    Object.keys(cpu).forEach((entry) => {
      const val = pathOr(0, [entry, 0, 'y'], cpu);
      sum += val;
    });
  });
  return sum;
};

export const normalizeValue = (value: number, numCores: number) => {
  const clamped = clamp(0, 100 * numCores)(value);
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
