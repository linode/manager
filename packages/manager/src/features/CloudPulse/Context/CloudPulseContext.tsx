import React from 'react';

import type { FilterData } from '../Dashboard/CloudPulseDashboardLanding';
import type { PdfData } from '../Dashboard/pdf/types';
import type { Dashboard } from '@linode/api-v4';

export type CloudPulseRegistry = {
  captureForExport: () => Promise<void>; // a wait function that resolves when all widgets have reported their export data
  clearDashboardPdfData: () => void;
  getActiveWidgetGroup: () => string | undefined;
  getCurrentServiceLabel: () => string;
  getDashboardPdfData: () => PdfData[];
  getGlobalFilterData: () => FilterData | undefined;
  getGlobalGroupBy: () => string[];
  getGlobalSelectedDashboard: () => Dashboard | undefined;
  isExporting: boolean;
  isWidgetLoading: boolean;
  setActiveWidgetGroup: (widgetGroup?: string) => void;
  setCurrentServiceLabel: (label: string) => void;
  setDashboardIsExporting: (isExporting: boolean) => void;
  setDashboardPdfData: (pdfData: PdfData) => void;
  setGlobalFilterData: (filterData: FilterData) => void;
  setGlobalGroupBy: (groupBy: string[]) => void;
  setGlobalSelectedDashboard: (dashboard: Dashboard) => void;
  setWidgetLoading: (widgetId: string, isLoading: boolean) => void;
};

export const CloudPulseContext = React.createContext<CloudPulseRegistry>({
  getActiveWidgetGroup: () => undefined,
  getGlobalFilterData: () => undefined,
  getGlobalSelectedDashboard: () => undefined,
  setGlobalSelectedDashboard: () => null,
  setGlobalFilterData: () => null,
  setGlobalGroupBy: () => null,
  getGlobalGroupBy: () => [],
  getDashboardPdfData: () => [],
  setDashboardPdfData: () => null,
  clearDashboardPdfData: () => null,
  isWidgetLoading: false,
  isExporting: false,
  setDashboardIsExporting: () => null,
  captureForExport: () => Promise.resolve(),
  setActiveWidgetGroup: () => null,
  setWidgetLoading: () => null,
  setCurrentServiceLabel: () => null,
  getCurrentServiceLabel: () => '',
});
