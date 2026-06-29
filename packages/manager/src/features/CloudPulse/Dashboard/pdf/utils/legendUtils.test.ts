import { capabilityServiceTypeMapping } from '@linode/api-v4';
import { jsPDF } from 'jspdf';

import {
  CloudPulseAvailableViews,
  CloudPulseSelectTypes,
} from 'src/features/CloudPulse/Utils/models';
import { formatTimestamp } from 'src/features/CloudPulse/Widget/csv/CloudPulseWidgetCSVUtils';

import { createPageHeaders } from './headerUtils';
import { drawLegendVertical } from './legendUtils';

import type { LegendUtilProps } from './legendUtils';

// Mock the page header creation utility to isolate layout calculations
vi.mock('./headerUtils', () => ({
  createPageHeaders: vi.fn().mockReturnValue(40),
}));

describe('drawLegendVertical', () => {
  let mockPdf: jsPDF;
  let defaultProps: LegendUtilProps;

  const start = new Date().getTime() - 3600 * 1000;
  const end = new Date().getTime();

  beforeEach(() => {
    vi.clearAllMocks();

    mockPdf = new jsPDF();

    vi.spyOn(mockPdf, 'setFillColor').mockReturnThis();
    vi.spyOn(mockPdf, 'rect').mockReturnThis();
    vi.spyOn(mockPdf, 'setTextColor').mockReturnThis();
    vi.spyOn(mockPdf, 'setFont').mockReturnThis();
    vi.spyOn(mockPdf, 'setFontSize').mockReturnThis();
    vi.spyOn(mockPdf, 'text').mockReturnThis();
    vi.spyOn(mockPdf, 'addImage').mockReturnThis();
    vi.spyOn(mockPdf, 'addPage').mockReturnThis();
    vi.spyOn(mockPdf, 'splitTextToSize').mockReturnValue([
      'Mocked Filter Line',
    ]);

    // Lock the internal page height to establish deterministic overflow bounds
    vi.spyOn(mockPdf.internal.pageSize, 'getHeight').mockReturnValue(800);

    defaultProps = {
      pdf: mockPdf,
      dashboardName: 'Analytics Dashboard',
      timeDuration: {
        preset: 'Last 24 Hours',
        timeZone: 'UTC',
        start: formatTimestamp(start, undefined),
        end: formatTimestamp(end, undefined),
      },
      pageWidth: 600,
      filterData: {
        id: { engine: ['MySQL'] },
        label: { engine: ['MySQL'] },
      },
      filterConfig: {
        filters: [
          {
            configuration: {
              filterKey: 'engine',
              children: ['region', 'resource_id'],
              filterType: 'string',
              isFilterable: false,
              isMetricsFilter: false,
              isMultiSelect: false,
              name: 'Database Engine',
              neededInViews: [CloudPulseAvailableViews.central],
              options: [
                { id: 'mysql', label: 'MySQL' },
                { id: 'postgresql', label: 'PostgreSQL' },
              ],
              placeholder: 'Select a Database Engine',
              priority: 2,
              type: CloudPulseSelectTypes.static,
            },
            name: 'DB Engine',
          },
        ],
        capability: capabilityServiceTypeMapping['dbaas'],
        serviceType: 'dbaas',
      },
      globalGroupBy: ['region'],
      legendRows: [
        {
          data: { average: 50, last: 60, max: 70, length: 10, total: 500 },
          format: (n: number) => `${n}ms`,
          legendColor: '#ff0000',
          legendTitle: 'Response Time',
        },
      ],
      maxWidth: 500,
      startX: 50,
      startY: 150,
    };
  });

  it('renders standard legend rows without breaking pages', () => {
    const result = drawLegendVertical(defaultProps);

    expect(result.newPage).toBe(false);
    expect(result.y).toBeGreaterThan(defaultProps.startY);
    expect(mockPdf.setFillColor).toHaveBeenCalledWith(255, 0, 0); // Converts #ff0000 to RGB
    expect(mockPdf.text).toHaveBeenCalledWith(
      'Mocked Filter Line',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('substitutes a gray background indicator color if a row is configured as hidden', () => {
    const hiddenProps: LegendUtilProps = {
      ...defaultProps,
      hiddenLegendRows: ['Response Time'],
    };

    drawLegendVertical(hiddenProps);

    // Fallback HEX '#a3a3ab' translates to RGB layout values (163, 163, 171)
    expect(mockPdf.setFillColor).toHaveBeenCalledWith(163, 163, 171);
  });

  it('forces a page break and builds fresh headers if layout requirements exceed page boundaries', () => {
    const overflowProps: LegendUtilProps = {
      ...defaultProps,
      startY: 780, // Placing start point target near the bottom cutoff line
    };

    const result = drawLegendVertical(overflowProps);

    expect(result.newPage).toBe(true);
    expect(mockPdf.addPage).toHaveBeenCalled();
    expect(createPageHeaders).toHaveBeenCalled();
  });
});
