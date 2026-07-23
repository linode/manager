import { Box, Typography } from '@linode/ui';
import React from 'react';

export type DonutChartLegendItem = {
  color: string;
  id: string;
  label: string;
  value: number;
  value1?: number | string;
  value2?: number | string;
};

export type DonutChartLegendProps = {
  columnProportions?: number[];
  items: DonutChartLegendItem[];
  total: number;
  valueFormatOptions?: {
    locale?: string | string[];
    value?: Intl.NumberFormatOptions;
    value1?: Intl.NumberFormatOptions;
    value2?: Intl.NumberFormatOptions;
  };
};

const DEFAULT_COLUMN_PROPORTIONS = [33.333, 33.333, 33.333] as const;

export const DonutChartLegend = ({
  columnProportions,
  items,
  total,
  valueFormatOptions,
}: DonutChartLegendProps) => {
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => b.value - a.value);
  }, [items]);

  const resolvedColumnProportions = React.useMemo(() => {
    if (
      !columnProportions ||
      columnProportions.length !== 3 ||
      columnProportions.some(
        (value) => !Number.isFinite(value) || Number(value) < 0
      )
    ) {
      return DEFAULT_COLUMN_PROPORTIONS;
    }

    const totalProportion = columnProportions.reduce(
      (sum, proportion) => sum + proportion,
      0
    );

    if (totalProportion <= 0) {
      return DEFAULT_COLUMN_PROPORTIONS;
    }

    return columnProportions.map(
      (proportion) => (proportion / totalProportion) * 100
    );
  }, [columnProportions]);

  const formatLegendValue = (
    legendValue: number | string,
    valueKey: 'value1' | 'value2' | 'value'
  ) => {
    if (typeof legendValue === 'number') {
      return new Intl.NumberFormat(
        valueFormatOptions?.locale ?? 'en-US',
        valueFormatOptions?.[valueKey]
      ).format(legendValue);
    }

    return legendValue;
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'row',
        gridTemplateColumns: '1fr',
        justifyItems: 'stretch',
        rowGap: 1,
        width: '100%',
      }}
    >
      {sortedItems.map((item) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        const value1 = item.value1 ?? `${percentage.toFixed(1)}%`;
        const value2 = item.value2;

        return (
          <Box
            key={item.id}
            sx={{
              alignItems: 'center',
              boxSizing: 'border-box',
              columnGap: 1.5,
              display: 'grid',
              gridTemplateColumns: `12px minmax(0, ${resolvedColumnProportions[0]}%) minmax(0, ${resolvedColumnProportions[1]}%) minmax(0, ${resolvedColumnProportions[2]}%)`,
              paddingRight: 1,
              paddingLeft: 3,
              width: '100%',
            }}
          >
            <Box
              sx={{
                backgroundColor: item.color,
                borderRadius: '50%',
                flexShrink: 0,
                height: 12,
                minHeight: 12,
                minWidth: 12,
                width: 12,
              }}
            />

            <Typography
              sx={(theme) => ({
                font: theme.font.semibold,
                fontSize: 13,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              })}
              title={item.label}
            >
              {item.label}
            </Typography>

            <Typography
              color="text.secondary"
              sx={() => ({
                fontSize: 13,
                justifySelf: 'start',
                whiteSpace: 'nowrap',
              })}
              variant="body1"
            >
              {formatLegendValue(value1, 'value1')}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: 13,
                justifySelf: 'start',
                whiteSpace: 'nowrap',
              }}
              variant="body1"
            >
              {value2 !== undefined ? formatLegendValue(value2, 'value2') : ''}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
