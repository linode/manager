import { Typography } from '@linode/ui';
import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { StyledLegend } from './MetricsDisplay.styles';

import type { Metrics } from '@linode/utilities';

const ROW_HEADERS = ['Max', 'Avg', 'Last'] as const;

type MetricKey = 'average' | 'last' | 'max';
const METRIC_KEYS: MetricKey[] = ['max', 'average', 'last'];

interface Props {
  /**
   * Array of rows to hide. Each row should contain the legend title.
   */
  hiddenRows?: string[];
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
  return (
    <TableHead sx={{ position: 'sticky', top: 0, zIndex: 2 }}>
      <TableRow>
        <TableCell />
        {ROW_HEADERS.map((header) => (
          <TableCell data-qa-header-cell key={header}>
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
    <TableRow data-qa-metric-row>
      <TableCell>
        <StyledLegend
          data-testid="legend-title"
          disableTouchRipple
          hidden={hidden}
          legendColor={legendColor}
          onClick={handleLegendClick}
        >
          <Typography component="span" data-qa-graph-row-title={legendTitle}>
            {legendTitle}
          </Typography>
        </StyledLegend>
      </TableCell>
      {METRIC_KEYS.map((key, idx) => (
        <TableCell
          data-qa-body-cell
          data-qa-graph-column-title={ROW_HEADERS[idx]}
          key={key}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {format(data[key])}
        </TableCell>
      ))}
    </TableRow>
  );
};

export const MetricsDisplay = ({ hiddenRows = [], rows }: Props) => (
  <Table aria-label="Stats and metrics" noOverflow stickyHeader>
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
  </Table>
);

export default MetricsDisplay;
