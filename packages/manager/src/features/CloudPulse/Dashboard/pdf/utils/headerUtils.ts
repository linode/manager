/**
 * Header Utility Functions
 * Handles rendering of PDF page headers, including logo, dashboard info, and filters
 */

import { RESOURCE_ID } from 'src/features/CloudPulse/Utils/constants';
import { convertStringToCamelCasesWithSpaces } from 'src/features/CloudPulse/Utils/utils';
import { formatDateTime } from 'src/features/CloudPulse/Widget/csv/CloudPulseWidgetCSVUtils';

import {
  FILTER_LINE_SPACING,
  HEADER_BAR_HEIGHT,
  HEADER_TOP_OFFSET,
  MARGIN,
  PDF_FONT,
} from '../constants/pdfConstants';

import type { PDFUtilProps } from '../types';

interface PageHeaderParams
  extends Omit<PDFUtilProps, 'filterConfig' | 'filterData' | 'timeDuration'> {
  /**
   * The formatted time range string to be displayed in the header, derived from the timeDuration prop in HeaderUtilProps and formatted using the formatDateTime utility function
   */
  timeRange: string;
}

interface GlobalFilterBoxParams
  extends Pick<PDFUtilProps, 'globalGroupBy' | 'pageWidth' | 'pdf'> {
  /**
   * The filter criteria string to be displayed in the global filter information box, derived from the filterData and filterConfig props in HeaderUtilProps and formatted using the appendAppliedFilters function to create a user-friendly representation of the applied filters
   */
  filterString: string;
}

type AppendAppliedFiltersParams = Pick<
  PDFUtilProps,
  'filterConfig' | 'filterData'
>;

/**
 * Draws the main page header bar with dashboard name and time range
 *
 * This creates a dark gray bar that spans the width of the page
 * and displays:
 * - Dashboard name on the left (bold)
 * - Time range on the right (normal weight)
 *
 * @param pdf - The jsPDF document instance
 * @param dashboardName - Name of the dashboard to display
 * @param timeRange - Formatted time range string to display
 * @param pageWidth - Width of the page (pre-calculated for performance)
 */
const drawPageHeader = ({
  pdf,
  dashboardName,
  timeRange,
  pageWidth,
}: PageHeaderParams): void => {
  const barX = MARGIN;
  const barY = HEADER_TOP_OFFSET;
  const barW = pageWidth - MARGIN * 2;

  // Draw dark gray background bar
  pdf.setFillColor(35, 35, 38);
  pdf.rect(barX, barY, barW, HEADER_BAR_HEIGHT, 'F');

  // Draw dashboard name (left-aligned, bold)
  pdf.setTextColor(255, 255, 255);
  pdf.setFont(PDF_FONT, 'bold');
  pdf.setFontSize(16);
  pdf.text(dashboardName, barX + 12, barY + 24);

  // Draw time range (right-aligned, normal)
  pdf.setFont(PDF_FONT, 'normal');
  pdf.setFontSize(10);
  pdf.text(timeRange, barX + barW - 8, barY + 24, { align: 'right' });
};

/**
 * Draws the global filter information box below the header
 *
 * This creates a light gray box that displays the current filter settings
 * applied to the dashboard
 *
 * @param pdf - The jsPDF document instance
 * @param filterString - The filter criteria string to display
 * @param pageWidth - Width of the page (pre-calculated for performance)
 */
const drawGlobalFilterBox = ({
  pdf,
  filterString,
  pageWidth,
  globalGroupBy,
}: GlobalFilterBoxParams): number => {
  let filterStringWithGroupBy = filterString;
  const boxStartGapFromHeader = 38; // Gap between header bar and filter box
  if (globalGroupBy?.length) {
    filterStringWithGroupBy +=
      (filterString ? ' | ' : '') + `Group By: ${globalGroupBy.join(', ')}`;
  }
  // Draw light gray background box
  pdf.setFillColor(247, 247, 250);

  // Draw filter text
  pdf.setTextColor(52, 52, 56);
  pdf.setFont(PDF_FONT, 'bold');
  pdf.setFontSize(8);

  const lines: string[] = pdf.splitTextToSize(
    filterStringWithGroupBy,
    pageWidth - MARGIN * 3
  );

  const boxHeight = lines.length * FILTER_LINE_SPACING + 10;
  pdf.rect(
    MARGIN,
    HEADER_TOP_OFFSET + boxStartGapFromHeader,
    pageWidth - MARGIN * 2,
    boxHeight,
    'F'
  );

  let currentY = HEADER_TOP_OFFSET + boxStartGapFromHeader + 10; // Start a bit lower for padding

  for (const line of lines) {
    pdf.text(line, MARGIN + 12, currentY);
    currentY += FILTER_LINE_SPACING;
  }

  // Return the Y position after the filter box
  return HEADER_TOP_OFFSET + boxStartGapFromHeader + boxHeight;
};

/**
 * @param props - The properties containing filter data and configuration to generate the filter string
 * @returns - The formatted filter string to be displayed in the global filter information box
 */
const appendAppliedFilters = ({
  filterData,
  filterConfig,
}: AppendAppliedFiltersParams): string => {
  if (!filterData?.label) return '';

  return filterConfig.filters
    .filter(({ configuration }) =>
      Boolean(filterData.label[configuration.filterKey]?.length)
    )
    .map(({ configuration }) => {
      const labelValue = filterData.label[configuration.filterKey];
      return `${configuration.name}: ${
        Array.isArray(labelValue) ? labelValue.join(', ') : labelValue
      }`;
    })
    .join('  |  ');
};

/**
 * Creates complete page headers including logo, dashboard info, and filters
 *
 * This is the main function for rendering all header elements on a page:
 * 1. Akamai logo (centered at top)
 * 2. Dashboard name and time range bar
 * 3. Global filter information box
 * @param props - The properties required to render the header
 * @returns Y position after header content (with 10px gap for widget content)
 */
export const createPageHeaders = ({
  pdf,
  dashboardName,
  timeDuration,
  pageWidth,
  filterData,
  filterConfig,
  akamaiLogoDataUrl,
  globalGroupBy,
  resourceLabels,
}: PDFUtilProps): number => {
  // Format the time range string from preset or custom range
  const start = formatDateTime(
    timeDuration.start,
    timeDuration.timeZone,
    false
  );

  const end = formatDateTime(timeDuration.end, timeDuration.timeZone);

  const timeRange =
    timeDuration.preset && timeDuration.preset !== 'Reset'
      ? convertStringToCamelCasesWithSpaces(timeDuration.preset)
      : `${start} - ${end}`;

  // Add Akamai logo (centered at top) if provided
  if (akamaiLogoDataUrl) {
    pdf.addImage(akamaiLogoDataUrl, 'JPEG', pageWidth / 2 - 40, 10, 80, 34);
  }

  // Draw the main header bar
  drawPageHeader({
    pdf,
    dashboardName,
    timeRange,
    pageWidth,
  });

  // Draw the filter information box and get final Y position
  const headerEndY = drawGlobalFilterBox({
    pdf,
    filterString: appendAppliedFilters({
      filterData: {
        id: filterData.id,
        label: {
          ...filterData.label,
          [RESOURCE_ID]: resourceLabels
            ? [resourceLabels]
            : filterData.label[RESOURCE_ID]
              ? filterData.label[RESOURCE_ID]
              : [], // if resource labels are provided, use them to override the filter labels for resource_id in the header, otherwise fall back to original filter labels
        },
      },
      filterConfig,
    }),
    pageWidth,
    globalGroupBy,
  });

  // Return Y position with 10px gap for content
  return headerEndY + 10;
};
