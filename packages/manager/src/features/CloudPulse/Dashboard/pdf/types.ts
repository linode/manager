import type { CloudPulseServiceTypeFilterMap } from '../../Utils/models';
import type { FilterData } from '../CloudPulseDashboardLanding';
import type { DateTimeWithPreset } from '@linode/api-v4';
import type jsPDF from 'jspdf';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

export interface PdfData {
  /**
   * The error text to display in the PDF if the graph data failed to load
   */
  errorText?: string;
  /**
   * The filter string representing the current data filters applied in the UI, to be displayed in the PDF
   */
  filterString: string;
  /**
   * The SVG element of the graph, which will be converted to an image and embedded in the PDF
   */
  graphSVG: null | { dataUrl: string; height: number; width: number };
  /**
   * Hidden keys in legend
   */
  hiddenLegendRows?: string[];
  /**
   * The legend data for the graph, used to render the legend in the PDF
   */
  legendRowData: MetricsDisplayRow[];
  /**
   * Indicates whether the graph data is still loading
   */
  loading: boolean;
  /**
   * The resources | entities selected
   */
  resourceLabels?: string;

  /**
   * The label of the widget, used for the graph title in the PDF
   */
  widgetLabel: string;
  /**
   * The label of the widget including the unit of measurement, used for the graph title in the PDF to provide more context about the displayed data
   */
  widgetLabelWithUnit: string;
}

export interface PDFUtilProps {
  /**
   * The Akamai logo url to be displayed in the header
   */
  akamaiLogoDataUrl?: string;
  /**
   * The name of the dashboard to be displayed in the header
   */
  dashboardName: string;
  /**
   * The filter configuration for the service type, used to map filter keys to user-friendly names in the header and CSV
   */
  filterConfig: CloudPulseServiceTypeFilterMap;
  /**
   * The filter data containing the applied filters information, used to display the current filter settings in the header and to build the complete CSV data including the applied filters information
   */
  filterData: FilterData;
  /**
   * The global group by settings for the dashboard, used to format the data in the header and CSV
   */
  globalGroupBy?: string[];
  /**
   * The width of the page
   */
  pageWidth: number;
  /**
   * The jsPDF document instance used to render the header elements on the PDF page
   */
  pdf: jsPDF;

  /**
   * The resource labels to be displayed in the header
   */
  resourceLabels?: string;

  /**
   * The time duration of the data being displayed, used to format the time range string in the header
   */
  timeDuration: DateTimeWithPreset;
}
