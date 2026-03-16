import { useSnackbar } from 'notistack';
import React from 'react';
import type { CSVLink } from 'react-csv';

import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';

import { generateCSVData } from './CloudPulseWidgetCSVUtils';

import type { CSVDataProps } from './CloudPulseWidgetCSVUtils';

export const CloudPulseWidgetCSVDownloader = React.memo(
  (props: CSVDataProps) => {
    const csvRef = React.useRef<(CSVLink & { link: HTMLAnchorElement }) | null>(
      null
    );
    const { enqueueSnackbar } = useSnackbar();
    const { data, widget, dashboardName, duration, isDataLoading } = props;
    const enableDownloadIcon =
      data &&
      data.length > 0 &&
      widget &&
      dashboardName &&
      duration &&
      !isDataLoading;
    const csvData = React.useMemo(
      () => (enableDownloadIcon ? generateCSVData(props) : []),
      [enableDownloadIcon, props]
    );

    const handleDownloadClick = React.useCallback(() => {
      csvRef.current?.link.click();
      enqueueSnackbar('Downloaded CSV.', {
        variant: 'success',
        autoHideDuration: 5000,
      });
    }, [enqueueSnackbar]);

    return (
      <DownloadCSV
        buttonType="styledLink"
        csvRef={csvRef}
        data={csvData}
        dataPendoId={`Widget CSV Download - ${widget.label ?? 'widget'}`}
        disabled={!enableDownloadIcon}
        filename={`${widget.label ?? 'widget'}.csv`}
        headers={[]}
        iconStyles={{
          height: '24px',
          width: '24px',
        }}
        onClick={handleDownloadClick}
        sx={(theme) => ({
          color: theme.tokens.alias.Content.Icon.Primary.Default, // consistent icon with other icons in the widget header
        })}
        text=""
      />
    );
  }
);
