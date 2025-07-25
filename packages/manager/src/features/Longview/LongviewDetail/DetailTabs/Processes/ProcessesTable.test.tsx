import * as React from 'react';

import { longviewProcessFactory } from 'src/factories/longviewProcess';
import { renderWithTheme } from 'src/utilities/testHelpers';

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
    const { getAllByTestId, getAllByText } = renderWithTheme(
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
    const { getByTestId } = renderWithTheme(
      <ProcessesTable {...props} processesLoading={true} />
    );
    getByTestId('table-row-loading');
  });

  it('renders error state', async () => {
    const { getByText } = renderWithTheme(
      <ProcessesTable {...props} error="Error!" />
    );
    getByText('Error!');
  });
});
