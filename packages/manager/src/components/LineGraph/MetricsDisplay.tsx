import * as React from 'react';

import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';

import {
  StyledButton,
  StyledTable,
  StyledTableCell,
} from './MetricDisplay.styles';

import type { Metrics } from 'src/utilities/statMetrics';

interface Props {
  /**
   * If true, the legends across metrics will be the same height
   */
  hasFixedLegendHeight?: boolean;
  /**
   * Height of the legend
   */
  height?: number;
  /**
   * Array of rows to hide. Each row should contain the legend title.
   */
  hiddenRows?: string[];
  /**
   * Maximum height of the legend
   */
  maxHeight?: number;
  /**
   * Array of rows to display. Each row should contain the data to display, the format function to use, the legend color, and the legend title.
   */
  rows: MetricsDisplayRow[];
}

export interface MetricsDisplayRow {
  data: Metrics;
  format: (n: number) => string;
  handleLegendClick?: () => void;
  legendColor:
    | 'blue'
    | 'darkGreen'
    | 'green'
    | 'lightGreen'
    | 'purple'
    | 'red'
    | 'yellow';
  legendTitle: string;
}

export const MetricsDisplay = ({
  hasFixedLegendHeight = false,
  height = 160,
  hiddenRows,
  maxHeight = 160,
  rows,
}: Props) => {
  const rowHeaders = ['Max', 'Avg', 'Last'];
  const sxProps = {
    borderTop: 'none !important',
  };

  return (
    <StyledTable
      sx={(theme) => ({
        '.MuiTable-root': {
          border: 0,
        },
        maxHeight,
        overflowY: 'auto',
        ...(hasFixedLegendHeight && {
          [theme.breakpoints.up(1100)]: {
            height,
          },
        }),
      })}
      aria-label="Stats and metrics"
      noBorder
      stickyHeader
    >
      <TableHead sx={{ ...sxProps, position: 'relative', zIndex: 2 }}>
        <TableRow sx={sxProps}>
          <TableCell sx={sxProps}>{''}</TableCell>
          {rowHeaders.map((section, idx) => (
            <TableCell data-qa-header-cell key={idx} sx={sxProps}>
              {section}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, idx) => {
          const {
            data,
            format,
            handleLegendClick,
            legendColor,
            legendTitle,
          } = row;
          const hidden = hiddenRows?.includes(legendTitle);
          const lastItem = idx === rows.length - 1;
          return (
            <TableRow
              sx={
                lastItem
                  ? {
                      '.MuiTableCell-root': {
                        borderBottom: 0,
                      },
                    }
                  : {}
              }
              data-qa-metric-row
              key={legendTitle}
            >
              <StyledTableCell>
                <StyledButton
                  data-testid="legend-title"
                  disableTouchRipple
                  hidden={hidden}
                  legendColor={legendColor}
                  onClick={handleLegendClick}
                >
                  <Typography component="span">{legendTitle}</Typography>
                </StyledButton>
              </StyledTableCell>
              {metricsBySection(data).map((section, idx) => {
                return (
                  <TableCell
                    data-qa-body-cell
                    key={idx}
                    parentColumn={rowHeaders[idx]}
                  >
                    {format(section)}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </StyledTable>
  );
};

// Grabs the sections we want (max, average, last) and puts them in an array
// so we can map through them and create JSX
export const metricsBySection = (data: Metrics): number[] => [
  data.max,
  data.average,
  data.last,
];

export default MetricsDisplay;
