import { Stats } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Typography from 'src/components/core/Typography';
import LineGraph from 'src/components/LineGraph';
import Notice from 'src/components/Notice';
import {
  convertNetworkToUnit,
  formatNetworkTooltip,
  generateNetworkUnits
} from 'src/features/Longview/shared/utilities';
import { useLinodeStats } from 'src/hooks/useLinodeStats';
import useProfile from 'src/hooks/useProfile';

interface TransferHistoryProps {
  linodeID: number;
}

export const TransferHistory: React.FC<TransferHistoryProps> = props => {
  const stats = useLinodeStats(props.linodeID);
  const { profile } = useProfile();

  const combinedData = stats.data ? combineGraphData(stats.data) : [];

  const max = combinedData.reduce((acc, thisStat) => {
    if (thisStat[1] > acc) {
      acc = thisStat[1];
    }
    return acc;
  }, 0);

  const unit = generateNetworkUnits(max);

  // @todo: remove this duplication (it's from NetworkGraph.tsx).
  const convertNetworkData = (value: number) => {
    return convertNetworkToUnit(value, unit as any);
  };

  /**
   * formatNetworkTooltip is a helper method from Longview, where
   * data is expected in bytes. The method does the rounding, unit conversions, etc.
   * that we want, but it first multiplies by 8 to convert to bits.
   * APIv4 returns this data in bits to begin with,
   * so we have to preemptively divide by 8 to counter the conversion inside the helper.
   *
   */
  const _formatTooltip = (valueInBytes: number) =>
    formatNetworkTooltip(valueInBytes / 8);

  return (
    <>
      <Typography style={{ marginBottom: '8px' }}>
        <strong>Network Transfer 30-Day History ({unit}/s)</strong>
      </Typography>
      {stats.loading && <CircleProgress mini />}
      {stats.errorMessage && <Notice error text={stats.errorMessage} />}
      <LineGraph
        timezone={profile.data?.timezone ?? 'UTC'}
        chartHeight={125}
        unit={`/s`}
        formatData={convertNetworkData}
        formatTooltip={_formatTooltip}
        // showToday={rangeSelection === '24'}
        showToday={true}
        data={[
          {
            borderColor: 'transparent',
            backgroundColor: '#5ad865',
            data: combinedData,
            label: 'Public Outbound traffic'
          }
        ]}
      />
    </>
  );
};

export default React.memo(TransferHistory);

// =============================================================================
// Utilities
// =============================================================================

export const combineGraphData = (stats: Stats) => {
  const v4PublicOut = stats.data.netv4.out;
  const v6PublicOut = stats.data.netv6.out;

  const combined: [number, number][] = [];

  v4PublicOut.forEach((thisStat, i) => {
    const timestamp = thisStat[0];
    let value = thisStat[1];

    if (v6PublicOut[i]?.[0] === timestamp) {
      combined[i] = [timestamp, (value += v6PublicOut[i]?.[1] ?? 0)];
    }
  });

  return combined;
};
