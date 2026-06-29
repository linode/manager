import { capabilityServiceTypeMapping } from '@linode/api-v4';
import { jsPDF } from 'jspdf';

import {
  CloudPulseAvailableViews,
  CloudPulseSelectTypes,
} from 'src/features/CloudPulse/Utils/models';
import { formatTimestamp } from 'src/features/CloudPulse/Widget/csv/CloudPulseWidgetCSVUtils';

import { createPageHeaders } from './headerUtils';

import type { PDFUtilProps } from '../types';

describe('createPageHeaders', () => {
  let mockPdf: jsPDF;
  let defaultProps: PDFUtilProps; // 1. Declare the variable type here

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
    vi.spyOn(mockPdf, 'splitTextToSize').mockReturnValue([
      'Mocked Filter Line',
    ]);

    // 2. Initialize defaultProps here, safely after mockPdf is assigned
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
    };
  });

  it('renders full header with logo, preset time, and filters', () => {
    const yPos = createPageHeaders({
      ...defaultProps,
      akamaiLogoDataUrl: 'mock-logo-url',
    });

    expect(mockPdf.addImage).toHaveBeenCalledWith(
      'mock-logo-url',
      'JPEG',
      260,
      10,
      80,
      34
    );
    expect(mockPdf.text).toHaveBeenCalledWith(
      'Analytics Dashboard',
      expect.any(Number),
      expect.any(Number)
    );
    expect(mockPdf.text).toHaveBeenCalledWith(
      'Last 24 Hours',
      expect.any(Number),
      expect.any(Number),
      { align: 'right' }
    );
    expect(typeof yPos).toBe('number');
    expect(yPos).toBe(124);
  });

  it('skips adding logo when akamaiLogoDataUrl is not provided', () => {
    createPageHeaders(defaultProps); // akamai logo is not provided

    expect(mockPdf.addImage).not.toHaveBeenCalled();
  });

  it('handles empty filters and empty globalGroupBy cleanly', () => {
    const emptyFiltersProps: PDFUtilProps = {
      ...defaultProps,
      filterData: { id: {}, label: {} },
      globalGroupBy: [],
    };

    createPageHeaders(emptyFiltersProps);

    expect(mockPdf.splitTextToSize).toHaveBeenCalledWith(
      '',
      expect.any(Number)
    );
  });
  it('formats multi-select filter arrays cleanly with comma separation', () => {
    const multiFilterProps: PDFUtilProps = {
      ...defaultProps,
      filterData: {
        id: { engine: ['MySQL', 'PostgreSQL'] },
        label: { engine: ['MySQL', 'PostgreSQL'] },
      },
    };

    createPageHeaders(multiFilterProps);

    expect(mockPdf.splitTextToSize).toHaveBeenCalledWith(
      expect.stringContaining('Database Engine: MySQL, PostgreSQL'),
      expect.any(Number)
    );
  });
  it('formats globalGroupBy without a leading separator if filter string is empty', () => {
    const onlyGroupByProps: PDFUtilProps = {
      ...defaultProps,
      filterData: { id: {}, label: {} },
      globalGroupBy: ['region', 'cluster'],
    };

    createPageHeaders(onlyGroupByProps);

    expect(mockPdf.splitTextToSize).toHaveBeenCalledWith(
      'Group By: region, cluster',
      expect.any(Number)
    );
  });
});
