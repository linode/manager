import { Stats } from '@linode/api-v4/lib/linodes';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { IconButton } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { DateTime, Interval } from 'luxon';
import * as React from 'react';

import PendingIcon from 'src/assets/icons/pending.svg';
import { AreaChart } from 'src/components/AreaChart';
import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LineGraph } from 'src/components/LineGraph/LineGraph';
import { Typography } from 'src/components/Typography';
import {
  convertNetworkToUnit,
  formatNetworkTooltip,
  generateNetworkUnits,
} from 'src/features/Longview/shared/utilities';
import { useFlags } from 'src/hooks/useFlags';
import {
  STATS_NOT_READY_API_MESSAGE,
  STATS_NOT_READY_MESSAGE,
  useLinodeStatsByDate,
  useLinodeTransferByDate,
} from 'src/queries/linodes/stats';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { readableBytes } from 'src/utilities/unitConversions';

interface Props {
  linodeCreated: string;
  linodeID: number;
}

export const TransferHistory = React.memo((props: Props) => {
  const { linodeCreated, linodeID } = props;

  const theme = useTheme();
  const flags = useFlags();

  // Needed to see the user's timezone.
  const { data: profile } = useProfile();

  // Offset used by the date picker. The number `0` represents the current month,
  // `-1` represents the previous month, etc. This value should not be greater than `0`.
  const [monthOffset, setMonthOffset] = React.useState(0);

  const now = DateTime.utc();

  const { humanizedDate, month, year } = parseMonthOffset(monthOffset, now);

  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
  } = useLinodeStatsByDate(linodeID, year, month, true, linodeCreated);

  const { data: transfer } = useLinodeTransferByDate(
    linodeID,
    year,
    month,
    monthOffset < 0
  );

  const bytesIn = readableBytes(transfer?.bytes_in ?? 0);
  const bytesOut = readableBytes(transfer?.bytes_out ?? 0);

  const combinedData = stats ? sumPublicOutboundTraffic(stats) : [];

  const max = combinedData.reduce((acc, thisStat) => {
    if (thisStat[1] > acc) {
      acc = thisStat[1];
    }
    return acc;
  }, 0);

  const unit = generateNetworkUnits(max);

  // The following two functions copied from LinodeSummary/NetworkGraph.tsx:
  const convertNetworkData = (value: number) => {
    return convertNetworkToUnit(value, unit);
  };

  /**
   * formatNetworkTooltip is a helper method from Longview, where
   * data is expected in bytes. The method does the rounding, unit conversions, etc.
   * that we want, but it first multiplies by 8 to convert to bits.
   * APIv4 returns this data in bits to begin with,
   * so we have to preemptively divide by 8 to counter the conversion inside the helper.
   */
  const formatTooltip = (valueInBytes: number) =>
    formatNetworkTooltip(valueInBytes / 8);

  const maxMonthOffset = getOffsetFromDate(
    now,
    DateTime.fromISO(linodeCreated, { zone: 'utc' })
  );

  const minMonthOffset = 0;

  const decrementOffset = () =>
    setMonthOffset((prevOffset) => Math.max(prevOffset - 1, maxMonthOffset));

  const decrementLabel = parseMonthOffset(monthOffset - 1, now)
    .longHumanizedDate;

  const incrementOffset = () =>
    setMonthOffset((prevOffset) => Math.min(prevOffset + 1, minMonthOffset));

  const incrementLabel = parseMonthOffset(monthOffset + 1, now)
    .longHumanizedDate;

  // In/Out totals from the /transfer endpoint are per-month (to align with billing cycle).
  // Graph data from the /stats endpoint works a bit differently: when you request data for the
  // CURRENT month/year, the resulting data is from the last 30 days.
  //
  // Thus, when requesting data for the CURRENT month/year the data sets are out of alignment.
  // Consequently, we only display In/Out totals when viewing previous months of data, which aligns
  // with the behavior of Legacy Manager.

  const displayInOutTotals = monthOffset < 0;

  const statsErrorString = statsError
    ? getAPIErrorOrDefault(statsError, 'Unable to load stats.')[0].reason
    : null;

  const graphAriaLabel = `Network Transfer History Graph for ${humanizedDate}`;

  const renderStatsGraph = () => {
    if (statsLoading) {
      return (
        <StyledDiv>
          <CircleProgress mini />
        </StyledDiv>
      );
    }

    if (statsErrorString) {
      const areStatsNotReady = [
        STATS_NOT_READY_API_MESSAGE,
        STATS_NOT_READY_MESSAGE,
      ].includes(statsErrorString);

      return (
        <ErrorState
          errorText={
            areStatsNotReady ? STATS_NOT_READY_MESSAGE : statsErrorString
          }
          CustomIcon={areStatsNotReady ? PendingIcon : undefined}
          compact
        />
      );
    }

    // @TODO recharts: remove conditional code and delete old chart when we decide recharts is stable
    if (flags?.recharts) {
      const timeData = combinedData.reduce((acc: any, point: any) => {
        acc.push({
          'Public Outbound Traffic': convertNetworkData
            ? convertNetworkData(point[1])
            : point[1],
          t: point[0],
        });
        return acc;
      }, []);

      return (
        <Box marginLeft={-5}>
          <AreaChart
            areas={[
              {
                color: '#1CB35C',
                dataKey: 'Public Outbound Traffic',
              },
            ]}
            xAxis={{
              tickFormat: 'LLL dd',
              tickGap: 15,
            }}
            aria-label={graphAriaLabel}
            data={timeData}
            height={190}
            timezone={profile?.timezone ?? 'UTC'}
            unit={unit}
          />
        </Box>
      );
    }

    return (
      <LineGraph
        data={[
          {
            backgroundColor: '#1CB35C',
            borderColor: 'transparent',
            data: combinedData,
            label: 'Public Outbound Traffic',
          },
        ]}
        accessibleDataTable={{ unit: 'Kb/s' }}
        ariaLabel={graphAriaLabel}
        chartHeight={190}
        formatData={convertNetworkData}
        formatTooltip={formatTooltip}
        showToday={true}
        tabIndex={-1}
        timezone={profile?.timezone ?? 'UTC'}
        unit={`/s`}
      />
    );
  };

  return (
    // Allow `tabIndex` on `<div>` because it represents an interactive element.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div aria-label={graphAriaLabel} role="graphics-document" tabIndex={0}>
      <Box
        alignItems="center"
        borderBottom={`1px solid ${theme.color.grey6}`}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        marginBottom="8px"
        paddingBottom="6px"
      >
        <Typography>
          <strong>Network Transfer History ({unit}/s)</strong>
        </Typography>
        {displayInOutTotals && transfer ? (
          <Typography>
            {bytesIn.formatted} In/{bytesOut.formatted} Out
          </Typography>
        ) : null}
        <Box
          alignItems="center"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
        >
          <IconButton
            aria-label={`Show Network Transfer History for ${decrementLabel}`}
            color="primary"
            disableRipple
            disabled={monthOffset === maxMonthOffset}
            onClick={decrementOffset}
            sx={{ padding: 0 }}
          >
            <ArrowBackIosIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
          {/* Give this a min-width so it doesn't change widths between displaying
          the month and "Last 30 Days" */}
          <span style={{ minWidth: 80, textAlign: 'center' }}>
            <Typography>{humanizedDate}</Typography>
          </span>
          <IconButton
            aria-label={`Show Network Transfer History for ${incrementLabel}`}
            color="primary"
            disableRipple
            disabled={monthOffset === minMonthOffset}
            onClick={incrementOffset}
            sx={{ padding: 0 }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      </Box>
      {renderStatsGraph()}
    </div>
  );
});

const StyledDiv = styled('div', { label: 'StyledDiv' })({
  alignItems: 'center',
  display: 'flex',
  height: 100,
  justifyContent: 'center',
});

// =============================================================================
// Utilities
// =============================================================================

export const sumPublicOutboundTraffic = (stats: Stats) => {
  const v4PublicOut = stats.data.netv4.out;
  const v6PublicOut = stats.data.netv6.out;

  const summed: [number, number][] = [];

  v4PublicOut.forEach((thisV4Stat, i) => {
    const [v4Timestamp, v4Value] = thisV4Stat;

    const v6Timestamp = v6PublicOut[i]?.[0] ?? 0;
    const v6Value = v6PublicOut[i]?.[1] ?? 0;

    // Make sure the timestamps match.
    if (v4Timestamp === v6Timestamp) {
      summed.push([v4Timestamp, v4Value + v6Value]);
    }
  });

  return summed;
};

/**
 * Get the year, month, and humanized month and year from a given offset.
 *
 * `0` refers to now, `1` refers to one month in the future, `-1` refers to
 * one month in the past, etc..
 *
 * @param offset - Number of months in the future or past to parse.
 * @param date - Date from which to base offset calculations.
 *
 * @returns Object containing numeric year, numeric month, and humanized dates for the given offset.
 */
export const parseMonthOffset = (offset: number, date: DateTime) => {
  const resultingDate = date.plus({ months: offset });
  const year = String(resultingDate.year);
  const month = String(resultingDate.month).padStart(2, '0');
  const humanizedDate =
    offset === 0 ? 'Last 30 Days' : resultingDate.toFormat('LLL y');
  const longHumanizedDate =
    offset === 0 ? 'Last 30 Days' : resultingDate.toFormat('LLLL y');
  return { humanizedDate, longHumanizedDate, month, year };
};

// We don't want to allow the user to scroll back further than the Linode was created,
// so we determine the max offset given "now" and a target date (i.e. Linode Created date).
export const getOffsetFromDate = (now: DateTime, target: DateTime) => {
  const interval = Interval.fromDateTimes(target, now);
  // Need to subtract `1` here, because Luxon considers these intervals to be inclusive.
  const count = interval.count('month') - 1;
  return count === 0 ? 0 : -count; // To avoid returning `-0`.
};
