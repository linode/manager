import { LoadingSpinner } from '@akamai/cds-components/react/LoadingSpinner';
import { Alias } from '@linode/design-language-system';
import {
  Box,
  Divider,
  keyframes,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@linode/ui';
import { DateTime } from 'luxon';
import React from 'react';

type MetricValue = number | string;
type PeriodValue = Date | DateTime | number | string;

export interface SingleMetricChartProps {
  colorIndex?: number;
  isLoading?: boolean;
  label: string;
  periodLabel?: string;
  prefix?: string;
  rangeEnd?: PeriodValue;
  rangeStart?: PeriodValue;
  suffix?: string;
  value: MetricValue;
  valueColor?: string;
}

const CATEGORICAL_COLORS = Object.values(Alias.Chart.Categorical).map(
  (categoricalColor) => categoricalColor.Primary
);

const HIGHLIGHT_DURATION_MS = 700;
const LOADING_TIMEOUT_MS = 15_000;
const LOADING_TRANSITION_DURATION_MS = 600;
const NO_DATA_FADE_IN_DELAY_MS = 400;
const NO_DATA_FADE_IN_DURATION_MS = 500;
const PEAK_BRIGHTNESS_DARK = 1.25;
const PEAK_BRIGHTNESS_LIGHT = 0.85;
const PEAK_SATURATION = 1.4;

const noDataFadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const buildPulse = (
  brightness: number,
  saturation: number,
  variant: 'a' | 'b'
) =>
  variant === 'a'
    ? keyframes`
        from {
          filter: brightness(${brightness}) saturate(${saturation});
        }
        to {
          filter: brightness(1) saturate(1);
        }
      `
    : keyframes`
        0% {
          filter: brightness(${brightness}) saturate(${saturation});
        }
        100% {
          filter: brightness(1) saturate(1);
        }
      `;

const normalizePeriodValue = (value?: PeriodValue) => {
  if (!value) {
    return null;
  }

  if (DateTime.isDateTime(value)) {
    return value;
  }

  if (value instanceof Date) {
    return DateTime.fromJSDate(value);
  }

  if (typeof value === 'number') {
    return DateTime.fromMillis(value);
  }

  const isoDate = DateTime.fromISO(value);

  if (isoDate.isValid) {
    return isoDate;
  }

  const jsDate = new Date(value);

  if (!Number.isNaN(jsDate.valueOf())) {
    return DateTime.fromJSDate(jsDate);
  }

  return null;
};

const formatPeriodRange = (
  rangeStart?: PeriodValue,
  rangeEnd?: PeriodValue
) => {
  const start = normalizePeriodValue(rangeStart);
  const end = normalizePeriodValue(rangeEnd);

  if (start && end) {
    return `${start.toLocaleString(DateTime.DATETIME_MED)} - ${end.toLocaleString(
      DateTime.DATETIME_MED
    )}`;
  }

  if (start) {
    return start.toLocaleString(DateTime.DATETIME_MED);
  }

  if (end) {
    return end.toLocaleString(DateTime.DATETIME_MED);
  }

  return '';
};

export const SingleMetricChart = ({
  colorIndex,
  isLoading = false,
  label,
  periodLabel,
  prefix,
  rangeEnd,
  rangeStart,
  suffix,
  value,
  valueColor,
}: SingleMetricChartProps) => {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';
  const [pulseTick, setPulseTick] = React.useState(0);
  const [hasLoadingTimedOut, setHasLoadingTimedOut] = React.useState(false);
  const hasMountedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isLoading) {
      setHasLoadingTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasLoadingTimedOut(true);
    }, LOADING_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  const showSpinner = isLoading && !hasLoadingTimedOut;
  const showLoadingNoData = isLoading && hasLoadingTimedOut;

  const displayValue = React.useMemo(
    () =>
      showLoadingNoData ? 'No Data' : `${prefix ?? ''}${value}${suffix ?? ''}`,
    [prefix, showLoadingNoData, suffix, value]
  );

  const isNoDataValue =
    showLoadingNoData ||
    (typeof value === 'string' && value.trim().toLowerCase() === 'no data');

  const resolvedPeriodLabel = React.useMemo(() => {
    return periodLabel?.trim() || formatPeriodRange(rangeStart, rangeEnd);
  }, [periodLabel, rangeEnd, rangeStart]);

  const [pulseA, pulseB] = React.useMemo(() => {
    const brightness = isDarkTheme
      ? PEAK_BRIGHTNESS_DARK
      : PEAK_BRIGHTNESS_LIGHT;

    return [
      buildPulse(brightness, PEAK_SATURATION, 'a'),
      buildPulse(brightness, PEAK_SATURATION, 'b'),
    ];
  }, [isDarkTheme]);

  React.useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setPulseTick((previous) => previous + 1);
  }, [displayValue]);

  const animationName =
    pulseTick === 0 ? undefined : pulseTick % 2 === 1 ? pulseA : pulseB;

  const valueAnimation = isNoDataValue
    ? `${noDataFadeIn} ${NO_DATA_FADE_IN_DURATION_MS}ms ease ${NO_DATA_FADE_IN_DELAY_MS}ms both`
    : animationName
      ? `${animationName} ${HIGHLIGHT_DURATION_MS}ms ease-out`
      : 'none';

  const fallbackValueColor =
    colorIndex === undefined
      ? theme.tokens.color.Teal[60]
      : CATEGORICAL_COLORS[colorIndex % CATEGORICAL_COLORS.length];

  const resolvedValueColor = isNoDataValue
    ? theme.palette.text.secondary
    : (valueColor ?? fallbackValueColor);

  return (
    <Paper
      sx={{ borderWidth: 0, p: '21px 13px 20px 13px', position: 'relative' }}
      variant="outlined"
    >
      <Stack
        gap={0}
        sx={{
          opacity: showSpinner ? 0 : 1,
          transition: `opacity ${LOADING_TRANSITION_DURATION_MS}ms ease`,
        }}
      >
        <Box
          sx={{
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
            animation: valueAnimation,
            width: 'fit-content',
          }}
        >
          <Typography
            sx={{
              color: resolvedValueColor,
              font: theme.font.bold,
              fontSize: '30px',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {displayValue}
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              color: 'text.primary',
              font: theme.font.bold,
              fontSize: '22px',
              lineHeight: 1.2,
              paddingTop: '10px',
              paddingLeft: '2px',
            }}
            variant="h2"
          >
            {label}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 50,
            marginTop: '11px',
            marginBottom: '12px',
            paddingLeft: '2px',
          }}
        >
          <Divider />
        </Box>

        <Typography
          color="text.secondary"
          sx={{
            font: theme.font.normal,
            fontSize: '18px',
            lineHeight: 1.2,
            paddingLeft: '2px',
          }}
          variant="h2"
        >
          {resolvedPeriodLabel}
        </Typography>
      </Stack>

      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          inset: 0,
          justifyContent: 'center',
          opacity: showSpinner ? 1 : 0,
          pointerEvents: showSpinner ? 'auto' : 'none',
          position: 'absolute',
          transition: `opacity ${LOADING_TRANSITION_DURATION_MS}ms ease`,
          zIndex: 2,
        }}
      >
        <LoadingSpinner size="extra-large" />
      </Box>
    </Paper>
  );
};
