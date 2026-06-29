/**
 * PDF Layout Constants
 *
 * All measurements are in pixels (px) — jsPDF 'px' unit maps 1-to-1 with pt
 * All widgets render at full width for optimal quality and clean layout
 */

// ---------------------------------------------------------------------------
// Page Margins and Spacing
// ---------------------------------------------------------------------------

/** Standard margin applied to all sides of the page */
export const MARGIN = 24;

// ---------------------------------------------------------------------------
// Header Layout
// ---------------------------------------------------------------------------

/** Height of the dark header bar containing dashboard name and time range */
export const HEADER_BAR_HEIGHT = 38;

/** Y-coordinate where the header bar begins (from top of page) */
export const HEADER_TOP_OFFSET = MARGIN + 30;

/** Y-coordinate where widget content begins (below header and filter box) */
export const CONTENT_START_Y = HEADER_TOP_OFFSET + HEADER_BAR_HEIGHT + 40;

// ---------------------------------------------------------------------------
// Legend Layout
// ---------------------------------------------------------------------------

/** Line height for each legend entry */
export const LEGEND_LINE_HEIGHT = 13;

/** Radius of the colored dot indicator in the legend */
export const LEGEND_DOT_RADIUS = 3;

/** Horizontal gap between legend dot and legend text */
export const LEGEND_DOT_TEXT_GAP = 7;

/** Vertical spacing between graph and its legend */
export const GRAPH_LEGEND_GAP = 20;

/** Maximum graph height in PDF to prevent oversized images (especially on mobile/tablet) */
export const MAX_GRAPH_HEIGHT = 139;

// ---------------------------------------------------------------------------
// Widget Layout and Spacing
// ---------------------------------------------------------------------------

/** Vertical spacing between widgets in different rows */
export const WIDGET_VERTICAL_SPACING = 10;

/** Gap before rendering graph content */
export const GRAPH_TOP_GAP = 8;

/** Vertical spacing for filter text lines */
export const FILTER_LINE_SPACING = 12;

/** Vertical spacing after widget title */
export const TITLE_BOTTOM_SPACING = 16;

// ---------------------------------------------------------------------------
// Page Break Configuration
// ---------------------------------------------------------------------------

/** Threshold for triggering page break (55% of page height) */
export const PAGE_BREAK_THRESHOLD = 0.55;

/** Reserved space at bottom of page for footer (page number & copyright) */
export const FOOTER_RESERVE_SPACE = 18;

export const PDF_FONT = 'helvetica';

// ---------------------------------------------------------------------------
// Additional Spacing Constants
// ---------------------------------------------------------------------------

/** Extra vertical spacing for visual separation between widget rows */
export const WIDGET_ROW_SEPARATION_SPACING = 5;

/** Vertical spacing before error content */
export const ERROR_CONTENT_TOP_SPACING = 10;

/** Vertical spacing after error icon */
export const ERROR_ICON_BOTTOM_SPACING = 16;

/** Vertical spacing after error text */
export const ERROR_TEXT_BOTTOM_SPACING = 20;

/** Horizontal extension for graph images (applied to each side) */
export const GRAPH_IMAGE_HORIZONTAL_EXTENSION = 20;

/** Additional width added to full-width graphs */
export const GRAPH_IMAGE_WIDTH_BONUS = 60;
