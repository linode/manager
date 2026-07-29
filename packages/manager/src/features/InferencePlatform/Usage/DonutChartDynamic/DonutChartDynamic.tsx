import { Box, useTheme } from '@linode/ui';
import { keyframes } from '@mui/material/styles';
import React from 'react';

import { DonutChart, type DonutChartProps } from 'src/components/DonutChart';
import { useUsageData } from 'src/features/InferencePlatform/Usage/UsageDataContext';

type DonutChartDynamicProps = Omit<DonutChartProps, 'data'> & {
  selectedSeriesId: string;
};

const HIGHLIGHT_DURATION_MS = 700;

// Brightness multiplier at the peak of a pulse. Brighter in dark theme, darker
// in light theme.
const PEAK_BRIGHTNESS_DARK = 1.25;
const PEAK_BRIGHTNESS_LIGHT = 0.85;
// Saturation multiplier at the peak of a pulse, so colors deepen instead of
// washing out when the brightness shifts.
const PEAK_SATURATION = 1.4;

// Builds a pulse keyframe with the peak filter baked in (no CSS variables, which
// are unreliable inside @keyframes). Two textually-distinct variants are created
// so Emotion generates different animation names; alternating the name on each
// update is what re-triggers the animation without remounting the chart (and
// therefore without replaying the chart's sweep animation).
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

export const DonutChartDynamic = ({
  selectedSeriesId,
  ...chartProps
}: DonutChartDynamicProps) => {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';
  const dynamicData = useUsageData();
  // Increments on each fresh data update; parity alternates the keyframe name.
  const [pulseTick, setPulseTick] = React.useState(0);
  const hasMountedRef = React.useRef(false);

  const [pulseA, pulseB] = React.useMemo(() => {
    const brightness = isDarkTheme
      ? PEAK_BRIGHTNESS_DARK
      : PEAK_BRIGHTNESS_LIGHT;

    return [
      buildPulse(brightness, PEAK_SATURATION, 'a'),
      buildPulse(brightness, PEAK_SATURATION, 'b'),
    ];
  }, [isDarkTheme]);

  const donutData = React.useMemo(() => {
    let filteredSeries = dynamicData.total.series;

    // Filter to specific series if selectedSeriesId is not 'all'
    if (selectedSeriesId && selectedSeriesId !== 'all') {
      filteredSeries = filteredSeries.filter(
        (series) => series.id === selectedSeriesId
      );
    }

    return filteredSeries
      .filter((series) => series.values.length > 0)
      .map((series) => {
        const totalValue = series.values.reduce(
          (sum, point) => sum + point.value,
          0
        );

        return {
          id: series.id,
          label: series.label,
          value: totalValue,
          value2: totalValue,
        };
      });
  }, [dynamicData.total.series, selectedSeriesId]);

  // Map each model id to its position in the full series list so colors stay
  // consistent with the other charts when a single model is selected.
  const seriesColorIndices = React.useMemo(() => {
    const indices: Record<string, number> = {};
    dynamicData.total.series.forEach((series, index) => {
      indices[series.id] = index;
    });
    return indices;
  }, [dynamicData.total.series]);

  // Trigger a CSS color pulse whenever fresh data arrives (skip first mount).
  React.useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setPulseTick((previous) => previous + 1);
  }, [dynamicData.total]);

  const animationName =
    pulseTick === 0 ? undefined : pulseTick % 2 === 1 ? pulseA : pulseB;

  return (
    <Box
      sx={{
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
        animation: animationName
          ? `${animationName} ${HIGHLIGHT_DURATION_MS}ms ease-out`
          : 'none',
        width: '100%',
      }}
    >
      <DonutChart
        {...chartProps}
        data={donutData}
        pieCx="50%"
        seriesColorIndices={seriesColorIndices}
      />
    </Box>
  );
};
