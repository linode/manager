import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { longviewTopProcessesFactory } from 'src/factories/longviewTopProcesses';
import { LongviewTopProcesses } from 'src/features/Longview/request.types';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { extendTopProcesses, Props, TopProcesses } from './TopProcesses';

afterEach(cleanup);

const props: Props = {
  topProcessesData: longviewTopProcessesFactory.build(),
  topProcessesLoading: false
};

describe('Top Processes', () => {
  describe('TopProcesses Component', () => {
    it('renders the title', () => {
      const { getByText } = render(wrapWithTheme(<TopProcesses {...props} />));
      getByText('Top Processes');
    });

    it('renders a View Details link', () => {
      const { getByText } = render(wrapWithTheme(<TopProcesses {...props} />));
      getByText('View Details');
    });

    it('renders rows for each process', () => {
      const data = longviewTopProcessesFactory.build();
      // The component renders a maximum of 6 rows. Assert our test data has
      // fewer than seven processes so the test is valid.
      expect(Object.keys(data.Processes || {}).length).toBeLessThan(7);

      const { getByText } = render(
        wrapWithTheme(<TopProcesses {...props} topProcessesData={data} />)
      );
      Object.keys(data.Processes || {}).forEach(processName => {
        getByText(processName);
      });
    });

    it('renders loading state', () => {
      const { getAllByTestId } = render(
        wrapWithTheme(
          <TopProcesses
            topProcessesData={{ Processes: {} }}
            topProcessesLoading={true}
          />
        )
      );
      getAllByTestId('skeletonCol');
    });

    it('renders error state', () => {
      const { getByText } = render(
        wrapWithTheme(
          <TopProcesses
            {...props}
            topProcessesData={{ Processes: {} }}
            topProcessesError={[{ reason: 'Error' }]}
          />
        )
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
      Object.keys(extendedData.Processes || {}).forEach(processName => {
        expect(normalizedData.find(p => p.name === processName)).toBeDefined();
      });
    });

    it('returns an empty array when Processes is undefined', () => {
      expect(extendTopProcesses({} as LongviewTopProcesses)).toEqual([]);
    });
  });
});
