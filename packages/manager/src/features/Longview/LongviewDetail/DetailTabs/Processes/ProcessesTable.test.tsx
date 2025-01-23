import * as React from 'react';

import { longviewProcessFactory } from 'src/factories/longviewProcess';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { extendData } from './ProcessesLanding';
import { ProcessesTable } from './ProcessesTable';

import type { ProcessesTableProps } from './ProcessesTable';

const mockSetSelectedRow = vi.fn();

const props: ProcessesTableProps = {
  processesData: [],
  processesLoading: false,
  selectedProcess: null,
  setSelectedProcess: mockSetSelectedRow,
};

describe('ProcessTable', () => {
  const extendedData = extendData(longviewProcessFactory.build());

  it('renders all columns for each row', async () => {
    const { getAllByTestId, getAllByText } = await renderWithThemeAndRouter(
      <ProcessesTable {...props} processesData={extendedData} />
    );
    extendedData.forEach((row) => {
      getAllByText(row.name);
      getAllByText(row.user);
      getAllByTestId(`max-count-${row.maxCount}`);
      getAllByTestId(`average-io-${row.averageIO}`);
      getAllByTestId(`average-cpu-${row.averageCPU}`);
      getAllByTestId(`average-mem-${row.averageMem}`);
    });
  });

  it('renders loading state', async () => {
    const { getByTestId } = await renderWithThemeAndRouter(
      <ProcessesTable {...props} processesLoading={true} />
    );
    getByTestId('table-row-loading');
  });

  it('renders error state', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <ProcessesTable {...props} error="Error!" />
    );
    getByText('Error!');
  });
});
