/**
 * Legend Utility Functions
 * Handles rendering of chart legends in the PDF
 */

import { Alias } from '@akamai/cds-tokens';

import {
  FOOTER_RESERVE_SPACE,
  LEGEND_DOT_RADIUS,
  LEGEND_DOT_TEXT_GAP,
  LEGEND_LINE_HEIGHT,
  PDF_FONT,
  WIDGET_VERTICAL_SPACING,
} from '../constants/pdfConstants';
import { hexToRgb } from './colorUtils';
import { createPageHeaders } from './headerUtils';

import type { PDFUtilProps } from '../types';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

export interface LegendUtilProps extends PDFUtilProps {
  /**
   * The hidden legend rows, used to filter out legend entries that should not be displayed in the PDF
   */
  hiddenLegendRows?: string[];
  /**
   * The legend data for the graph, used to render the legend in the PDF
   */
  legendRows: MetricsDisplayRow[];
  /**
   * The max width for the legend text
   */
  maxWidth: number;
  /**
   * The start X coordinate for the legend rendering
   */
  startX: number;
  /**
   * The start Y coordinate for the legend rendering
   */
  startY: number;
}

/**
 * Builds a formatted legend text string with metrics data
 *
 * @param row - The metrics display row containing legend and data information
 * @returns Formatted string showing legend title with avg, last, and max values
 *
 * @example
 * buildLegendText(row) // returns "CPU Usage  avg: 45.2  last: 48.1  max: 92.5"
 */
export const buildLegendText = (row: MetricsDisplayRow): string =>
  `${row.legendTitle} | Max ${row.format(row.data.max)}, Avg ${row.format(row.data.average)}, Last ${row.format(row.data.last)}`;

/**
 * Renders a legend with colored dots and metrics (avg, last, max)
 * @param props - The properties containing PDF instance, legend data, and layout information for rendering the legend in the PDF
 * @returns { newPage, y } - Page break flag and final Y position
 */
export const drawLegendVertical = ({
  pdf,
  legendRows,
  startX,
  startY,
  maxWidth,
  dashboardName,
  timeDuration,
  pageWidth,
  filterData,
  filterConfig,
  akamaiLogoDataUrl,
  hiddenLegendRows,
}: LegendUtilProps): {
  newPage: boolean;
  y: number;
} => {
  // Early return if no legend entries
  if (!legendRows.length) return { y: startY, newPage: false };

  // Set font style for legend text
  pdf.setFont(PDF_FONT, 'normal');
  pdf.setFontSize(9);

  // Calculate text starting position (after dot and gap)
  const textStartX = startX + 10 + LEGEND_DOT_RADIUS * 2 + LEGEND_DOT_TEXT_GAP;
  const textMaxWidth =
    maxWidth - LEGEND_DOT_RADIUS * 2 - LEGEND_DOT_TEXT_GAP - 4;
  let legendY = startY;
  let newPage = false;

  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxY = pageHeight - FOOTER_RESERVE_SPACE;

  legendRows.forEach((row, index) => {
    const text = buildLegendText(row);
    const lines: string[] = pdf.splitTextToSize(text, textMaxWidth);

    // Check if the next legend entry (including all wrapped lines) will fit
    const requiredSpace = lines.length * LEGEND_LINE_HEIGHT;
    if (legendY + requiredSpace > maxY) {
      pdf.addPage();
      legendY = createPageHeaders({
        pdf,
        dashboardName,
        timeDuration,
        pageWidth,
        filterData,
        filterConfig,
        akamaiLogoDataUrl,
      });
      newPage = true;
      legendY += WIDGET_VERTICAL_SPACING;
    }

    // Draw the colored dot indicator
    const [r, g, b] = hexToRgb(
      hiddenLegendRows?.includes(row.legendTitle)
        ? Alias.Content.Text.Primary.Disabled
        : row.legendColor
    );
    pdf.setFillColor(r, g, b);
    pdf.rect(startX + 10, legendY - 6, 8, 8, 'F');

    // Draw each wrapped line
    lines.forEach((line: string, li: number) => {
      pdf.setTextColor(68, 68, 68);
      legendY = legendY + (li === 0 ? 0 : LEGEND_LINE_HEIGHT);
      pdf.text(line, textStartX, legendY);
    });

    if (index < legendRows.length) {
      legendY += 3; // Small gap after legend entry
      // Add spacing and separator line after each entry (except last)
      if (index < legendRows.length - 1) {
        legendY += LEGEND_LINE_HEIGHT;
      } else {
        legendY += 2; // Extra small spacing after last entry
      }
    }
  });

  return { y: legendY, newPage };
};
