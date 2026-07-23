import { screen } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, it } from 'vitest';

import {
  akamaiObjectStorageDestinationFactory,
  streamFactory,
} from 'src/factories';
import { StreamLanding } from 'src/features/Delivery/Streams/Stream/StreamLanding';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

const queryMocks = vi.hoisted(() => ({
  useStreamQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useStreamQuery: queryMocks.useStreamQuery,
  };
});

const streamId = 123;
const mockDestinations = [
  akamaiObjectStorageDestinationFactory.build({ id: 1 }),
];
const mockStream = streamFactory.build({
  id: streamId,
  label: `Stream ${streamId}`,
  destinations: mockDestinations,
});

describe('StreamLanding', () => {
  const renderComponent = () => {
    renderWithTheme(<StreamLanding />, {
      initialRoute: '/logs/delivery/streams/$streamId/summary',
    });
  };

  describe('and stream has loaded successfully', () => {
    beforeEach(async () => {
      queryMocks.useStreamQuery.mockReturnValue({
        data: mockStream,
        isLoading: false,
      });

      // The Summary tab renders StreamEdit, which fetches destinations.
      server.use(
        http.get('*/monitor/streams/destinations', () => {
          return HttpResponse.json(makeResourcePage(mockDestinations));
        })
      );
    });

    describe('and metrics are enabled', () => {
      it('should render the summary tab and metrics tab', async () => {
        renderComponent();

        expect(await screen.findByText('Summary')).toBeInTheDocument();
        expect(await screen.findByText('Metrics')).toBeInTheDocument();
      });
    });
  });

  describe('and stream is loading', () => {
    beforeEach(async () => {
      queryMocks.useStreamQuery.mockReturnValue({
        isLoading: true,
      });
    });

    it('should render loading spinner', async () => {
      renderComponent();

      expect(await screen.findByTestId('circle-progress')).toBeInTheDocument();
      expect(screen.queryByText('Summary')).not.toBeInTheDocument();
      expect(screen.queryByText('Metrics')).not.toBeInTheDocument();
    });
  });

  describe('and stream request threw error', () => {
    const streamErrorMessage = 'Stream not found';
    beforeEach(async () => {
      queryMocks.useStreamQuery.mockReturnValue({
        isLoading: false,
        error: [{ reason: streamErrorMessage }],
      });
    });

    it('should render error state with message', async () => {
      renderComponent();

      expect(await screen.findByText(streamErrorMessage)).toBeInTheDocument();
      expect(screen.queryByText('Summary')).not.toBeInTheDocument();
      expect(screen.queryByText('Metrics')).not.toBeInTheDocument();
    });
  });
});
