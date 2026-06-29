import { useProfile } from '@linode/queries';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import React from 'react';

import { useCloudPulseContext } from '../../../Context/useCloudPulseContext';
import { defaultTimeDuration } from '../../../Utils/CloudPulseDateTimePickerUtils';
import { FILTER_CONFIG } from '../../../Utils/FilterConfig';
import { constructPdfDashboardData } from '../CloudPulsePdfDownloader';

import type { FilterData } from '../../CloudPulseDashboardLanding';
import type { ConstructPdfDashboardDataProps } from '../CloudPulsePdfDownloader';
import type { Dashboard, DateTimeWithPreset } from '@linode/api-v4';

interface UsePdfExportProps {
  /**
   * The current dashboard being viewed
   */
  dashboard: Dashboard | undefined;
  /**
   * The current filter data applied to the dashboard
   */
  filterData: FilterData;
  /**
   * The current time duration selected for the dashboard
   */
  timeDuration?: DateTimeWithPreset;
}

export const usePdfExport = ({
  dashboard,
  filterData,
  timeDuration,
}: UsePdfExportProps) => {
  const { data: profile } = useProfile();
  const { enqueueSnackbar } = useSnackbar();
  const {
    getDashboardPdfData,
    clearDashboardPdfData,
    getGlobalGroupBy,
    captureForExport,
    getCurrentServiceLabel,
  } = useCloudPulseContext();

  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);

  const timezone =
    profile?.timezone === 'GMT'
      ? 'Etc/GMT'
      : (profile?.timezone ?? DateTime.local().zoneName);

  // Side-effect coordinator that listens for the state change
  React.useEffect(() => {
    // If the flag is false, do nothing
    if (!isDownloadingPdf) return;

    // Create an inner async function to handle the heavy lifting
    const processExport = async () => {
      try {
        if (!dashboard) return;

        const filterConfig = FILTER_CONFIG.get(dashboard.id);

        if (!filterConfig) {
          return;
        }

        // Render the hidden full-size graphs on demand, wait for capture, then
        // generate the PDF while those graphs are still mounted.

        const pdfUtilProps: ConstructPdfDashboardDataProps = {
          dashboardName:
            getCurrentServiceLabel() && dashboard
              ? `${getCurrentServiceLabel()}  -  ${dashboard.label}`
              : dashboard?.label || '',
          timeDuration: timeDuration ?? defaultTimeDuration(timezone),
          filterData,
          filterConfig,
          globalGroupBy: getGlobalGroupBy() || [],
        };
        await captureForExport();
        await constructPdfDashboardData(pdfUtilProps, getDashboardPdfData());
        enqueueSnackbar('Downloaded PDF.', { variant: 'success' });
      } catch {
        enqueueSnackbar('Unable to download PDF.', { variant: 'error' });
      } finally {
        clearDashboardPdfData();
        setIsDownloadingPdf(false);
      }
    };

    processExport();
  }, [
    isDownloadingPdf,
    captureForExport,
    clearDashboardPdfData,
    dashboard,
    filterData,
    getDashboardPdfData,
    getGlobalGroupBy,
    timeDuration,
    timezone,
    enqueueSnackbar,
    getCurrentServiceLabel,
  ]);

  const handleDownloadPDF = React.useCallback(() => {
    setIsDownloadingPdf(true);
  }, []);

  return { handleDownloadPDF, isDownloadingPdf };
};
