import { clamp, pathOr } from 'ramda';
import * as React from 'react';
import { WithTheme, withTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { pluralize } from 'src/utilities/pluralize';
import { CPU } from '../../request.types';
import { baseGaugeProps, BaseProps as Props } from './common';

import withClientStats, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';

type CombinedProps = Props & WithTheme & LVDataProps;

export const getFinalUsedCPU = (data: LVDataProps['longviewClientData']) => {
  const numberOfCores = pathOr(0, ['SysInfo', 'cpu', 'cores'], data);
  const usedCPU = sumCPUUsage(data.CPU);
  return normalizeValue(usedCPU, numberOfCores);
};

const CPUGauge: React.FC<CombinedProps> = (props) => {
  const {
    longviewClientDataLoading: loading,
    longviewClientDataError: error,
    longviewClientData,
    lastUpdatedError,
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
      // doesn't exist or is 0.
      max={100 * numberOfCores}
      value={usedCPU}
      innerText={innerText(
        finalUsedCPU || 0,
        loading,
        !!error || !!lastUpdatedError
      )}
      filledInColor={props.theme.graphs.blue}
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
