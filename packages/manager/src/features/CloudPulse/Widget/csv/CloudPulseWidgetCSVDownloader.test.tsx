import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { widgetFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { FILTER_CONFIG } from '../../Utils/FilterConfig';
import { CloudPulseWidgetCSVDownloader } from './CloudPulseWidgetCSVDownloader';

import type { CSVDataProps } from './CloudPulseWidgetCSVUtils';

const mockEnqueueSnackbar = vi.fn();
vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: mockEnqueueSnackbar,
    }),
  };
});
const baseProps: CSVDataProps = {
  dashboardName: 'Test Dashboard',
  data: [{ timestamp: 1718000000000, value: 42 }],
  dimensionFilters: [],
  dimensionOptions: [],
  duration: { start: '2026-01-01', end: '2026-01-02' },
  filterConfig:
    FILTER_CONFIG.get(1) ??
    vi.mockObject({
      capability: 'Managed Databases',
      filters: [],
      serviceType: 'dbaas',
    }),
  filters: { id: {}, label: {} },
  groupBy: [],
  isDataLoading: false,
  serviceType: 'linode',
  widget: widgetFactory.build({ label: 'Test Widget' }),
};

describe('CloudPulseWidgetCSVDownloader', () => {
  beforeEach(() => {
    mockEnqueueSnackbar.mockClear();
  });
  it('should render download button disabled when data is loading', () => {
    const { getByRole } = renderWithTheme(
      <CloudPulseWidgetCSVDownloader {...baseProps} isDataLoading={true} />
    );
    const button = getByRole('button');
    expect(button).toBeDisabled();
  });
  it('should render download button enabled when data is available', () => {
    const { getByRole } = renderWithTheme(
      <CloudPulseWidgetCSVDownloader {...baseProps} />
    );
    const button = getByRole('button');
    expect(button).toBeEnabled();
    const csvLink = getByRole('link', { hidden: true });
    expect(csvLink).toHaveAttribute('download', 'Test Widget.csv');
  });
  it('should show success message when download is clicked', async () => {
    const { getByRole } = renderWithTheme(
      <CloudPulseWidgetCSVDownloader {...baseProps} />
    );
    const button = getByRole('button');

    await userEvent.click(button);

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Downloaded CSV.', {
        variant: 'success',
        autoHideDuration: 5000,
      });
    });
  });
});
