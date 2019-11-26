import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import {
  CombinedProps,
  LongviewDetailOverview
} from './LongviewDetailOverview';

afterEach(cleanup);

const props: CombinedProps = {
  client: '1234',
  longviewClientData: {},
  topProcessesData: { Processes: {} },
  topProcessesLoading: false,
  listeningPortsData: { Ports: { listening: [], active: [] } },
  listeningPortsLoading: false,
  ...reactRouterProps,
  match: {
    ...reactRouterProps.match,
    params: { id: '1234' },
    url: `/longview/clients/${1234}`
  },
  location: {
    ...reactRouterProps.location,
    pathname: `/longview/clients/${1234}/overview`
  }
};

describe('LongviewDetail', () => {
  describe('Top Processes section', () => {
    it('renders the title', () => {
      const { getByText } = render(
        wrapWithTheme(<LongviewDetailOverview {...props} />)
      );
      getByText('Top Processes');
    });

    it('renders loading state when loading', () => {
      const { getByText } = render(
        wrapWithTheme(
          <LongviewDetailOverview {...props} topProcessesLoading={true} />
        )
      );
      getByText('Loading...');
    });

    it("renders error state when there's an error", () => {
      const { getByText } = render(
        wrapWithTheme(
          <LongviewDetailOverview
            {...props}
            topProcessesLoading={false}
            topProcessesError={[{ reason: 'An error occurred.' }]}
          />
        )
      );
      getByText('Error!');
    });
  });
});
