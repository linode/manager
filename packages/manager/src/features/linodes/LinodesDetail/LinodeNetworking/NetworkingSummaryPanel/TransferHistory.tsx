import { Stats } from '@linode/api-v4/lib/linodes';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import classNames from 'classnames';
import { DateTime, Interval } from 'luxon';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import LineGraph from 'src/components/LineGraph';
import {
  convertNetworkToUnit,
  formatNetworkTooltip,
  generateNetworkUnits,
} from 'src/features/Longview/shared/utilities';
import {
  STATS_NOT_READY_API_MESSAGE,
  STATS_NOT_READY_MESSAGE,
  useLinodeStatsByDate,
  useLinodeTransferByDate,
} from 'src/queries/linodes';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { readableBytes } from 'src/utilities/unitConversions';
import PendingIcon from 'src/assets/icons/pending.svg';

const useStyles = makeStyles((theme: Theme) => ({
  arrowIconOuter: {
    ...theme.applyLinkStyles,
    display: 'flex',
  },
  arrowIconInner: {
    fontSize: '1rem',
  },
  arrowIconForward: {
    transform: 'rotate(180deg)',
  },
  arrowIconDisabled: {
    fill: theme.color.grey1,
    cursor: 'not-allowed',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  graphHeaderContainer: {
    borderBottom: `1px solid ${theme.color.grey6}`,
  },
}));

interface Props {
  linodeID: number;
  linodeCreated: string;
}

export const TransferHistory: React.FC<Props> = (props) => {
  const { linodeID, linodeCreated } = props;

  const classes = useStyles();

  // Needed to see the user's timezone.
  const { data: profile } = useProfile();

  // Offset used by the date picker. The number `0` represents the current month,
  // `-1` represents the previous month, etc. This value should not be greater than `0`.
  const [monthOffset, setMonthOffset] = React.useState(0);

  const now = DateTime.utc();

  const { year, month, humanizedDate } = parseMonthOffset(monthOffset, now);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
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

  const incrementOffset = () =>
    setMonthOffset((prevOffset) => Math.min(prevOffset + 1, minMonthOffset));

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

  const renderStatsGraph = () => {
    if (statsLoading) {
      return (
        <div className={classes.loading}>
          <CircleProgress mini />
        </div>
      );
    }

    if (statsErrorString) {
      const areStatsNotReady = [
        STATS_NOT_READY_API_MESSAGE,
        STATS_NOT_READY_MESSAGE,
      ].includes(statsErrorString);

      return (
        <ErrorState
          CustomIcon={areStatsNotReady ? PendingIcon : undefined}
          errorText={
            areStatsNotReady ? STATS_NOT_READY_MESSAGE : statsErrorString
          }
          compact
        />
      );
    }

    return (
      <LineGraph
        timezone={profile?.timezone ?? 'UTC'}
        chartHeight={190}
        unit={`/s`}
        formatData={convertNetworkData}
        formatTooltip={formatTooltip}
        showToday={true}
        data={[
          {
            borderColor: 'transparent',
            backgroundColor: '#5ad865',
            data: combinedData,
            label: 'Public Outbound Traffic',
          },
        ]}
      />
    );
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="8px"
        paddingBottom="6px"
        className={classes.graphHeaderContainer}
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
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <button className={classes.arrowIconOuter} onClick={decrementOffset}>
            <ArrowBackIosIcon
              className={classNames({
                [classes.arrowIconInner]: true,
                [classes.arrowIconDisabled]: monthOffset === maxMonthOffset,
              })}
            />
          </button>
          {/* Give this a min-width so it doesn't change widths between displaying
          the month and "Last 30 Days" */}
          <span style={{ minWidth: 80, textAlign: 'center' }}>
            <Typography>{humanizedDate}</Typography>
          </span>
          <button className={classes.arrowIconOuter} onClick={incrementOffset}>
            <ArrowBackIosIcon
              className={classNames({
                [classes.arrowIconInner]: true,
                [classes.arrowIconForward]: true,
                [classes.arrowIconDisabled]: monthOffset === minMonthOffset,
              })}
            />
          </button>
        </Box>
      </Box>
      {renderStatsGraph()}
    </>
  );
};

export default React.memo(TransferHistory);

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

// Get the year, month, and humanized month/year, assuming an offset of `0` refers to "now".
// An offset of `-1` refers to the previous month, `-2` refers to two months ago, etc.
export const parseMonthOffset = (offset: number, date: DateTime) => {
  if (offset > 0) {
    throw Error('Offset must be <= 0');
  }

  const resultingDate = date.minus({ months: Math.abs(offset) });

  const year = String(resultingDate.year);
  const month = String(resultingDate.month).padStart(2, '0');
  const humanizedDate =
    offset === 0 ? 'Last 30 Days' : resultingDate.toFormat('LLL y');
  return { year, month, humanizedDate };
};

// We don't want to allow the user to scroll back further than the Linode was created,
// so we determine the max offset given "now" and a target date (i.e. Linode Created date).
export const getOffsetFromDate = (now: DateTime, target: DateTime) => {
  const interval = Interval.fromDateTimes(target, now);
  // Need to subtract `1` here, because Luxon considers these intervals to be inclusive.
  const count = interval.count('month') - 1;
  return count === 0 ? 0 : -count; // To avoid returning `-0`.
};
