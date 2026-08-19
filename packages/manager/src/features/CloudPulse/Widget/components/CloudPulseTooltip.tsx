import { Box, Paper, styled, Typography } from '@linode/ui';
import React from 'react';

import {
  tooltipLabelFormatter,
  tooltipValueFormatter,
} from 'src/components/AreaChart/utils';

import type {
  CloudPulseTooltipProps,
  TooltipMetricRowProps,
  TooltipPayloadEntryWithData,
  TooltipPayloadWithData,
} from './chartTypes';
import type { TooltipMetricEntry } from 'src/components/AreaChart/AreaChart';

const MAX_TOOLTIP_ITEMS = 30; // current max height can accommodate 30 items, so we limit the number of items displayed to avoid overflow and unnecessary iteration over the entire payload.

const getSortedTooltipMetricEntries = (
  payloadData: TooltipPayloadEntryWithData['payload'] | undefined
): TooltipMetricEntry[] => {
  if (!payloadData) {
    return [];
  }

  return Object.entries(payloadData)
    .filter(
      (entry): entry is TooltipMetricEntry =>
        entry[0] !== 'timestamp' && typeof entry[1] === 'number'
    )
    .sort(([, firstValue], [, secondValue]) => secondValue - firstValue);
};

const isTooltipPayloadWithData = (
  payload: CloudPulseTooltipProps['payload']
): payload is TooltipPayloadWithData => {
  if (!Array.isArray(payload)) {
    return false;
  }

  return payload.every(
    (entry): entry is TooltipPayloadEntryWithData =>
      typeof entry === 'object' &&
      entry !== null &&
      'payload' in entry &&
      typeof entry.payload === 'object' &&
      entry.payload !== null &&
      'timestamp' in entry.payload &&
      typeof entry.payload.timestamp === 'number'
  );
};

export const CloudPulseTooltip = React.memo(
  ({
    label,
    payload,
    customTooltipOptions,
    timezone,
    tooltipCustomValueFormatter,
    unit,
    tooltipRef,
  }: CloudPulseTooltipProps) => {
    const {
      areasColorMap = {},
      tooltipWrapperStyle,
      tooltipEntriesByTimestamp,
      tooltipFilter: filteredTooltip,
      hiddenLegendRows,
      active,
    } = customTooltipOptions ?? {};
    const typedPayload = isTooltipPayloadWithData(payload)
      ? payload
      : undefined;
    const primaryPayloadEntry = typedPayload?.[0];
    const payloadData = primaryPayloadEntry?.payload;

    const metricEntries = React.useMemo(() => {
      // get the next entries from pre computed tooltipEntriesByTimestamp if available, otherwise compute from payloadData
      const nextEntries =
        payloadData?.timestamp !== undefined
          ? (tooltipEntriesByTimestamp?.get(payloadData.timestamp) ??
            getSortedTooltipMetricEntries(payloadData))
          : getSortedTooltipMetricEntries(payloadData);

      // If there is no selected metric, return the default limited tooltip view.
      if (!filteredTooltip) {
        return nextEntries
          .filter(
            ([metricName]) =>
              hiddenLegendRows && !hiddenLegendRows.includes(metricName)
          )
          .slice(0, MAX_TOOLTIP_ITEMS);
      }

      const selectedMetricEntry = nextEntries.find(
        ([metricName]) => metricName === filteredTooltip.dataKey
      );

      if (!selectedMetricEntry) {
        return [];
      }

      const selectedMetricValue = selectedMetricEntry[1];

      return nextEntries.filter(
        ([, metricValue]) => metricValue === selectedMetricValue
      );
    }, [
      filteredTooltip,
      hiddenLegendRows,
      payloadData,
      tooltipEntriesByTimestamp,
    ]);

    if (
      active &&
      primaryPayloadEntry &&
      typeof label === 'number' &&
      metricEntries.length > 0
    ) {
      return (
        <Box>
          <StyledTooltipPaper ref={tooltipRef} sx={tooltipWrapperStyle}>
            <Typography
              sx={(theme) => ({
                font: theme.font.bold,
                fontSize: theme.tokens.font.FontSize.Xs,
              })}
            >
              {tooltipLabelFormatter(label, timezone)}
            </Typography>
            {metricEntries.map(([metricName, metricValue]) => {
              const metricValueLabel = tooltipCustomValueFormatter
                ? tooltipCustomValueFormatter(metricValue, unit)
                : tooltipValueFormatter(metricValue, unit);

              return (
                <TooltipMetricRow
                  areaColor={areasColorMap[metricName] ?? 'transparent'}
                  key={metricName}
                  metricName={metricName}
                  metricValueLabel={metricValueLabel}
                />
              );
            })}
          </StyledTooltipPaper>
        </Box>
      );
    }

    return null;
  }
);

const StyledTooltipPaper = styled(Paper, {
  label: 'StyledTooltipPaper',
})(({ theme }) => ({
  border: `1px solid ${theme.color.border2}`,
  padding: theme.spacingFunction(8),
}));

const TooltipMetricRow = React.memo(
  ({ areaColor, metricName, metricValueLabel }: TooltipMetricRowProps) => {
    return (
      <Box display="flex" sx={{ alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            backgroundColor: areaColor,
            flex: '0 0 auto',
            height: 6,
            width: 6,
          }}
        />
        <Typography
          sx={(theme) => ({
            font: theme.font.normal,
            flex: '1 1 0',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: theme.tokens.font.FontSize.Xs,
          })}
        >
          {metricName}
        </Typography>
        <Typography
          marginLeft={2}
          sx={(theme) => ({
            font: theme.font.bold,
            flex: '0 0 auto',
            whiteSpace: 'nowrap',
            textAlign: 'right',
            fontSize: theme.tokens.font.FontSize.Xs,
          })}
        >
          {metricValueLabel}
        </Typography>
      </Box>
    );
  }
);
