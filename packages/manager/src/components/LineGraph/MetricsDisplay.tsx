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
} from './MetricsDisplay.styles';

import type { Metrics } from 'src/utilities/statMetrics';

const ROW_HEADERS = ['Max', 'Avg', 'Last'] as const;

type MetricKey = 'average' | 'last' | 'max';
const METRIC_KEYS: MetricKey[] = ['max', 'average', 'last'];

interface Props {
  /**
   * Array of rows to hide. Each row should contain the legend title.
   */
  hiddenRows?: string[];
  /**
   * Sets the height of the legend. Overflow scroll if the content exceeds the height.
   */
  legendHeight?: string;
  /**
   * Array of rows to display. Each row should contain the data to display, the format function to use, the legend color, and the legend title.
   */
  rows: MetricsDisplayRow[];
}

export interface MetricsDisplayRow {
  data: Metrics;
  format: (n: number) => string;
  handleLegendClick?: () => void;
  legendColor: string;
  legendTitle: string;
}

const HeaderRow = () => {
  const sxProps = { borderTop: 'none !important' };
  return (
    <TableHead sx={{ ...sxProps, position: 'relative', zIndex: 2 }}>
      <TableRow sx={sxProps}>
        <TableCell sx={sxProps} />
        {ROW_HEADERS.map((header) => (
          <TableCell data-qa-header-cell key={header} sx={sxProps}>
            {header}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const MetricRow = ({
  hidden,
  row,
}: {
  hidden?: boolean;
  row: MetricsDisplayRow;
}) => {
  const { data, format, handleLegendClick, legendColor, legendTitle } = row;

  return (
    <TableRow
      sx={{
        '&:last-child': {
          '.MuiTableCell-root': {
            borderBottom: 0,
          },
        },
      }}
      data-qa-metric-row
    >
      <StyledTableCell>
        <StyledButton
          data-testid="legend-title"
          disableTouchRipple
          hidden={hidden}
          legendColor={legendColor}
          onClick={handleLegendClick}
        >
          <Typography component="span" data-qa-graph-row-title={legendTitle}>
            {legendTitle}
          </Typography>
        </StyledButton>
      </StyledTableCell>
      {METRIC_KEYS.map((key, idx) => (
        <TableCell
          data-qa-body-cell
          data-qa-graph-column-title={ROW_HEADERS[idx]}
          key={key}
          parentColumn={ROW_HEADERS[idx]}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {format(data[key])}
        </TableCell>
      ))}
    </TableRow>
  );
};

export const MetricsDisplay = ({
  hiddenRows = [],
  legendHeight = '100%',
  rows,
}: Props) => (
  <StyledTable
    sx={{
      '.MuiTable-root': {
        border: 0,
      },
      height: legendHeight,
      overflowY: 'auto',
    }}
    aria-label="Stats and metrics"
    stickyHeader
  >
    <HeaderRow />
    <TableBody>
      {rows.map((row) => (
        <MetricRow
          hidden={hiddenRows.includes(row.legendTitle)}
          key={row.legendTitle}
          row={row}
        />
      ))}
    </TableBody>
  </StyledTable>
);

export default MetricsDisplay;
