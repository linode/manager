// Hooks shared between AreaChart and BarChart. Unlike chartUtils.ts, these need
// React's render lifecycle (memoization, state, refs) so they can't be plain utils.
import * as React from 'react';

import type { CustomTooltipOptions, CustomTooltipProps } from './chartTypes';
import type { TooltipContentProps } from 'recharts';

interface UseTooltipWrapperProps {
  /**
   * The hidden legend rows
   */
  activeSeries: string[];
  /** Consumer-supplied tooltip component; falls back to DefaultTooltip when omitted. */
  CustomConsumerTooltip?: React.ComponentType<CustomTooltipProps>;
  /**
   * The properties need to the custom tooltip
   */
  customTooltipOptions?: CustomTooltipOptions;
  /** Chart's own default tooltip renderer, used when no CustomConsumerTooltip is supplied. */
  DefaultTooltip: React.ComponentType<CustomTooltipProps>;
  /**
   * Whether the tooltip is visible or not. If undefined, the tooltip will be visible when the user hovers over a data point.
   */
  isTooltipVisible?: boolean;
  /**
   * The timezone to use for formatting the tooltip's timestamp.
   */
  timezone: string;
  /**
   * A function to format the tooltip value. If not provided, the default formatting will be used.
   */
  tooltipCustomValueFormatter?: (value: number, unit: string) => string;
  /**
   * A ref to the tooltip element. This can be used to position the tooltip or to get its dimensions.
   */
  tooltipRef?: React.RefObject<HTMLDivElement | null>;
  /**
   * The unit to use for formatting the tooltip value. This is used in the default formatting if tooltipCustomValueFormatter is not provided.
   */
  unit: string;
}

/**
 * Builds the memoized tooltip content renderer passed to recharts' `<Tooltip content>`.
 * Kept as a hook (not a util) because it needs `useCallback` for stable identity — recharts
 * treats `content` like a component reference, so a new identity every render would remount
 * the tooltip subtree and drop `tooltipRef`/hover state.
 */
export const useTooltipWrapper = ({
  CustomConsumerTooltip,
  DefaultTooltip,
  activeSeries,
  customTooltipOptions,
  isTooltipVisible,
  timezone,
  tooltipCustomValueFormatter,
  tooltipRef,
  unit,
}: UseTooltipWrapperProps) =>
  React.useCallback(
    (tooltipProps: TooltipContentProps) => {
      const controlledTooltipActive =
        isTooltipVisible === undefined
          ? undefined
          : Boolean(tooltipProps.active && isTooltipVisible);

      return CustomConsumerTooltip ? (
        React.createElement(CustomConsumerTooltip, {
          ...tooltipProps,
          customTooltipOptions: {
            ...customTooltipOptions,
            active: controlledTooltipActive,
            hiddenLegendRows: activeSeries,
          },
          timezone,
          tooltipCustomValueFormatter,
          tooltipRef,
          unit,
        })
      ) : (
        <DefaultTooltip
          {...tooltipProps}
          timezone={timezone}
          tooltipCustomValueFormatter={tooltipCustomValueFormatter}
          tooltipRef={tooltipRef}
          unit={unit}
        />
      );
    },
    [
      CustomConsumerTooltip,
      DefaultTooltip,
      activeSeries,
      customTooltipOptions,
      isTooltipVisible,
      timezone,
      tooltipCustomValueFormatter,
      tooltipRef,
      unit,
    ]
  );
