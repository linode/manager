import * as React from 'react';

import { longviewTopProcessesFactory } from 'src/factories/longviewTopProcesses';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { TopProcesses, extendTopProcesses } from './TopProcesses';

import type { Props } from './TopProcesses';
import type { LongviewTopProcesses } from 'src/features/Longview/request.types';

const props: Props = {
  clientID: 1,
  topProcessesData: longviewTopProcessesFactory.build(),
  topProcessesLoading: false,
};

describe('Top Processes', () => {
  describe('TopProcesses Component', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('renders the title', async () => {
      const { getByText } = await renderWithThemeAndRouter(
        <TopProcesses {...props} />
      );
      getByText('Top Processes');
    });

    it('renders the View Details link', async () => {
      const { queryByText } = await renderWithThemeAndRouter(
        <TopProcesses {...props} />
      );
      expect(queryByText('View Details')).toBeDefined();
    });

    it('renders rows for each process', async () => {
      const data = longviewTopProcessesFactory.build();
      // The component renders a maximum of 6 rows. Assert our test data has
      // fewer than seven processes so the test is valid.
      expect(Object.keys(data.Processes || {}).length).toBeLessThan(7);

      const { getByText } = await renderWithThemeAndRouter(
        <TopProcesses {...props} topProcessesData={data} />
      );
      Object.keys(data.Processes || {}).forEach((processName) => {
        getByText(processName);
      });
    });

    it('renders loading state', async () => {
      const { getAllByTestId } = await renderWithThemeAndRouter(
        <TopProcesses
          clientID={1}
          topProcessesData={{ Processes: {} }}
          topProcessesLoading={true}
        />
      );
      getAllByTestId('table-row-loading');
    });

    it('renders error state', async () => {
      const { getByText } = await renderWithThemeAndRouter(
        <TopProcesses
          {...props}
          topProcessesData={{ Processes: {} }}
          topProcessesError={[{ reason: 'Error' }]}
        />
      );
      getByText('There was an error getting Top Processes.');
    });
  });

  describe('extendTopProcesses utility', () => {
    const extendedData = longviewTopProcessesFactory.build();
    const normalizedData = extendTopProcesses(extendedData);
    it('returns an element for each process', () => {
      expect(normalizedData.length).toBe(
        Object.keys(extendedData.Processes || {}).length
      );
    });

    it('returns each process name', () => {
      Object.keys(extendedData.Processes || {}).forEach((processName) => {
        expect(
          normalizedData.find((p) => p.name === processName)
        ).toBeDefined();
      });
    });

    it('returns an empty array when Processes is undefined', () => {
      expect(extendTopProcesses({} as LongviewTopProcesses)).toEqual([]);
    });
  });
});
