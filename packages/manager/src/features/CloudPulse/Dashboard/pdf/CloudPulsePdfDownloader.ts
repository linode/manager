/**
 * CloudPulse PDF Generator - Simplified Full-Width Layout
 *
 * Generates PDF documents from CloudPulse dashboard data.
 * All widgets render at full width for optimal quality and clean layout.
 */

import { Alias } from '@akamai/cds-tokens';
import { jsPDF } from 'jspdf';

import AlertColorIcon from 'src/assets/icons/alert-color.svg?url';
import AkamaiLogoSmallIcon from 'src/assets/logo/akamai-logo-small.svg?url';

import {
  ERROR_CONTENT_TOP_SPACING,
  ERROR_ICON_BOTTOM_SPACING,
  ERROR_TEXT_BOTTOM_SPACING,
  FILTER_LINE_SPACING,
  FOOTER_RESERVE_SPACE,
  GRAPH_IMAGE_HORIZONTAL_EXTENSION,
  GRAPH_IMAGE_WIDTH_BONUS,
  GRAPH_LEGEND_GAP,
  GRAPH_TOP_GAP,
  MARGIN,
  MAX_GRAPH_HEIGHT,
  PAGE_BREAK_THRESHOLD,
  PDF_FONT,
  TITLE_BOTTOM_SPACING,
  WIDGET_ROW_SEPARATION_SPACING,
  WIDGET_VERTICAL_SPACING,
} from './constants/pdfConstants';
import { hexToRgb } from './utils/colorUtils';
import { createPageHeaders } from './utils/headerUtils';
import { svgToDataURL } from './utils/imageUtils';
import { drawLegendVertical } from './utils/legendUtils';

import type { PdfData, PDFUtilProps } from './types';

export type ConstructPdfDashboardDataProps = Omit<
  PDFUtilProps,
  'pageWidth' | 'pdf'
>;
// ---------------------------------------------------------------------------
// Main PDF Construction
// ---------------------------------------------------------------------------
/**
 * Generates a PDF document from CloudPulse dashboard data
 *
 * Workflow:
 * 1. Initialize PDF with page headers (logo, dashboard name, time range)
 * 2. Convert all widget SVGs to images in parallel for performance
 * 3. Render each widget full-width with title, filters, graph, and legend
 * 4. Handle automatic page breaks when content exceeds page boundaries
 * 5. Save the completed PDF
 *
 * @param pdfData - Array of widget data to render
 * @param dashboardName - Dashboard name (used for title and filename)
 * @param timeDuration - Time range for the dashboard data
 */
export const constructPdfDashboardData = async (
  props: ConstructPdfDashboardDataProps,
  pdfData: PdfData[]
): Promise<void> => {
  const {
    dashboardName,
    timeDuration,
    filterData,
    filterConfig,
    globalGroupBy,
  } = props;
  // Initialize PDF document with pixel units
  const pdf = new jsPDF({ unit: 'px' });

  // Calculate page dimensions and content area
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;

  // Cache logo and error icon for performance
  const akamaiLogoDataUrl = await svgToDataURL(AkamaiLogoSmallIcon);

  const errorIcon = await svgToDataURL(AlertColorIcon);
  const headerProps: PDFUtilProps = {
    dashboardName,
    timeDuration,
    filterData,
    filterConfig,
    akamaiLogoDataUrl: akamaiLogoDataUrl.dataUrl,
    pageWidth,
    pdf,
    globalGroupBy,
    resourceLabels: pdfData[0]?.resourceLabels, // use resource label from first widget, we are sure it's same across all widgets in the dashboard
  };

  // Render first page headers and get starting Y position
  let currentY = createPageHeaders({ ...headerProps });

  currentY += WIDGET_VERTICAL_SPACING; // Initial spacing before first widget

  // Render each widget
  for (let i = 0; i < pdfData.length; i++) {
    const data = pdfData[i];
    const svgConversion = pdfData[i].graphSVG;
    const hasError = !!data.errorText;

    // Skip if no graph data available (for non-error cases)
    if (!hasError && !svgConversion) continue;

    try {
      // Add spacing between widgets
      currentY += WIDGET_VERTICAL_SPACING + WIDGET_ROW_SEPARATION_SPACING;

      // Render widget title
      pdf.setFont(PDF_FONT, 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(...hexToRgb(Alias.Content.Text.Primary.Default));
      pdf.text(data.widgetLabelWithUnit, MARGIN, currentY);
      currentY += TITLE_BOTTOM_SPACING;

      // Render filter string if present
      if (data.filterString) {
        pdf.setFont(PDF_FONT, 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...hexToRgb(Alias.Content.Text.Secondary.Default));

        const lines: string[] = pdf.splitTextToSize(
          data.filterString,
          contentWidth - 10
        );

        for (const line of lines) {
          pdf.text(line, MARGIN, currentY);
          currentY += FILTER_LINE_SPACING;
        }
      }

      currentY += GRAPH_TOP_GAP;

      // Render error state or graph
      if (hasError) {
        currentY += ERROR_CONTENT_TOP_SPACING;
        // Render error icon centered
        const errorIconSize = 25; // Fixed icon size for consistency
        const iconX = (pageWidth - errorIconSize) / 2; // Center horizontally
        pdf.addImage(
          errorIcon.dataUrl,
          'JPEG',
          iconX,
          currentY,
          errorIconSize,
          errorIconSize
        );
        currentY += errorIconSize + ERROR_ICON_BOTTOM_SPACING;

        // Render error text centered below icon
        pdf.setFont(PDF_FONT, 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...hexToRgb(Alias.Content.Text.Primary.Default));
        pdf.text(
          data.errorText || 'Error loading data',
          pageWidth / 2,
          currentY,
          {
            align: 'center',
          }
        );
        currentY += ERROR_TEXT_BOTTOM_SPACING + WIDGET_VERTICAL_SPACING;
      } else {
        // Get graph image data
        if (!svgConversion) continue;
        const { dataUrl, width: svgW, height: svgH } = svgConversion;
        // Scale to full width first (extend 20px on each side for better visual)
        const imgScale = contentWidth / svgW;
        let imgW = contentWidth;
        let imgH = svgH * imgScale;

        // Cap height if too tall (especially for mobile/tablet views)
        if (imgH > MAX_GRAPH_HEIGHT) {
          imgH = MAX_GRAPH_HEIGHT;
          // Recalculate width to maintain aspect ratio
          imgW = (svgW / svgH) * imgH;
          // Center the image if it's narrower than extended width
          const imgX = MARGIN + (contentWidth - imgW) / 2;
          pdf.addImage(
            dataUrl,
            'JPEG',
            imgX - GRAPH_IMAGE_HORIZONTAL_EXTENSION,
            currentY,
            imgW + GRAPH_IMAGE_WIDTH_BONUS,
            imgH
          );
        } else {
          pdf.addImage(dataUrl, 'JPEG', MARGIN, currentY, imgW, imgH);
        }

        if (data.legendRowData.length === 0) {
          // add no data to display at the center of graph if there is no legend data to display
          pdf.setFont(PDF_FONT, 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(...hexToRgb(Alias.Content.Text.Secondary.Default));
          pdf.text('No data to display', pageWidth / 2, currentY + imgH / 2, {
            align: 'center',
          });
        }

        currentY += imgH + GRAPH_LEGEND_GAP;

        // Render legend (only for graphs, not errors)
        const legendResult = drawLegendVertical({
          pdf,
          legendRows: data.legendRowData,
          startX: MARGIN,
          startY: currentY,
          maxWidth: contentWidth,
          dashboardName,
          timeDuration,
          filterData,
          filterConfig,
          akamaiLogoDataUrl: akamaiLogoDataUrl.dataUrl,
          pageWidth,
          hiddenLegendRows: data.hiddenLegendRows,
        });

        currentY = legendResult.y;

        // Handle legend page overflow
        if (legendResult.newPage) {
          currentY += WIDGET_VERTICAL_SPACING; // Spacing after page break
          continue; // Skip page break check since we just added a page
        }
      }

      if (
        i < pdfData.length - 1 &&
        currentY > pageHeight * PAGE_BREAK_THRESHOLD
      ) {
        pdf.addPage();
        currentY = createPageHeaders({ ...headerProps });
        currentY += WIDGET_VERTICAL_SPACING; // Initial spacing before first widget on new page
      }
    } catch {
      // Skip widgets that fail to render
    }
  }

  // Add footer line, page numbers, and copyright to all pages
  const totalPages = pdf.getNumberOfPages();
  const footerY = pageHeight - 10;
  const footerLineY = pageHeight - FOOTER_RESERVE_SPACE;

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    // Draw separator line above footer
    pdf.setDrawColor(...hexToRgb(Alias.Content.Text.Secondary.Default));
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN, footerLineY, pageWidth - MARGIN, footerLineY);

    // Set footer text style
    pdf.setFontSize(10);
    pdf.setFont(PDF_FONT, 'normal');
    pdf.setTextColor(...hexToRgb(Alias.Content.Text.Primary.Default));

    // Page number (right-aligned)
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - MARGIN, footerY, {
      align: 'right',
    });

    // Copyright text (centered)
    pdf.text(
      `© ${new Date().getFullYear()} Akamai Technologies, Inc. All Rights Reserved`,
      pageWidth / 2,
      footerY,
      {
        align: 'center',
      }
    );
  }

  pdf.save(`${dashboardName}.pdf`);
};
