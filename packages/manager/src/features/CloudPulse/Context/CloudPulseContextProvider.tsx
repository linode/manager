import * as React from 'react';

import { CloudPulseContext } from './CloudPulseContext';

import type { FilterData } from '../Dashboard/CloudPulseDashboardLanding';
import type { PdfData } from '../Dashboard/pdf/types';
import type { Dashboard } from '@linode/api-v4';

interface CloudPulseProviderProps {
  /**
   * The children of the provider, which will have access to the CloudPulse context
   */
  children: React.ReactNode;
}

export const CloudPulseContextProvider = ({
  children,
}: CloudPulseProviderProps) => {
  const globalFilterData = React.useRef<FilterData | undefined>(undefined);
  const globalSelectedDashboard = React.useRef<Dashboard | undefined>(
    undefined
  );
  const globalGroupBy = React.useRef<string[]>([]);
  const pdfData = React.useRef<Map<string, PdfData>>(undefined);
  const loadingWidgets = React.useRef<Set<string>>(new Set());
  const currentServiceLabel = React.useRef<string>('');
  const [isAnyWidgetLoading, setIsAnyWidgetLoading] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const pdfResolveRef = React.useRef<(() => void) | null>(null);

  const setGlobalFilterData = React.useCallback((filterData: FilterData) => {
    globalFilterData.current = filterData;
  }, []);

  const getGlobalFilterData = React.useCallback(() => {
    return globalFilterData.current;
  }, []);

  const setGlobalSelectedDashboard = React.useCallback(
    (dashboard: Dashboard) => {
      // Placeholder for potential future use if we need to register dashboard-level data
      globalSelectedDashboard.current = dashboard;
    },
    []
  );

  const getGlobalSelectedDashboard = React.useCallback(() => {
    return globalSelectedDashboard.current;
  }, []);

  const setGlobalGroupBy = React.useCallback((groupBy: string[]) => {
    globalGroupBy.current = groupBy;
  }, []);

  const getGlobalGroupBy = React.useCallback(() => {
    return globalGroupBy.current;
  }, []);

  const setDashboardPdfData = React.useCallback(
    (data: PdfData) => {
      if (data?.widgetLabel) {
        if (!pdfData.current) {
          pdfData.current = new Map<string, PdfData>();
        }
        pdfData.current.set(data.widgetLabel, data);

        // After setting, check if we hit the target
        const targetCount = getGlobalSelectedDashboard()?.widgets?.length || 0;

        if (pdfData.current.size === targetCount) {
          // All widgets have reported in! Trigger the resolve.
          if (pdfResolveRef.current) {
            pdfResolveRef.current();
            pdfResolveRef.current = null; // Clean up
          }
        }
      }
    },
    [getGlobalSelectedDashboard]
  );

  const setWidgetLoading = React.useCallback(
    (widgetLabel: string, isLoading: boolean) => {
      if (isLoading) {
        loadingWidgets.current.add(widgetLabel);
      } else {
        loadingWidgets.current.delete(widgetLabel);
      }

      setIsAnyWidgetLoading(loadingWidgets.current.size > 0);
    },
    []
  );

  const getDashboardPdfData = React.useCallback(() => {
    return pdfData.current ? Array.from(pdfData.current.values()) : [];
  }, []);

  const clearDashboardPdfData = React.useCallback(() => {
    if (pdfData.current) {
      pdfData.current = undefined;
    }
  }, []);

  const setDashboardIsExporting = React.useCallback(
    (isExporting: boolean) => {
      setIsExporting(isExporting);
    },
    [setIsExporting]
  );

  const captureForExport = React.useCallback(async () => {
    // 1. Clear old data
    if (pdfData.current) {
      pdfData.current.clear();
    }

    // 2. Trigger wrappers to mount
    setIsExporting(true);

    // 3. Return a Promise that gets resolved elsewhere (or times out)
    await new Promise<void>((resolve, reject) => {
      pdfResolveRef.current = resolve; // Expose resolve to the outside

      // Failsafe timeout
      setTimeout(() => {
        if (pdfResolveRef.current) {
          pdfResolveRef.current = null;
          reject(new Error('Unable to download PDF.')); // reject on timeout
        }
      }, 10000);
    });

    // 4. Unmount the wrappers once the promise resolves
    setIsExporting(false);
  }, []);

  const setCurrentServiceLabel = React.useCallback((label: string) => {
    // Placeholder for potential future use if we need to register service-level data
    currentServiceLabel.current = label;
  }, []);

  const getCurrentServiceLabel = React.useCallback(() => {
    return currentServiceLabel.current;
  }, []);

  return (
    <CloudPulseContext.Provider
      value={{
        setGlobalFilterData,
        getGlobalFilterData,
        setGlobalSelectedDashboard,
        getGlobalSelectedDashboard,
        setGlobalGroupBy,
        getGlobalGroupBy,
        setDashboardPdfData,
        getDashboardPdfData,
        clearDashboardPdfData,
        isWidgetLoading: isAnyWidgetLoading,
        setDashboardIsExporting,
        captureForExport,
        setWidgetLoading,
        setCurrentServiceLabel,
        getCurrentServiceLabel,
        isExporting,
      }}
    >
      {children}
    </CloudPulseContext.Provider>
  );
};
