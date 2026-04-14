import { screen } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, it } from 'vitest';

import {
  akamaiObjectStorageDestinationFactory,
  streamFactory,
} from 'src/factories';
import { StreamLanding } from 'src/features/Delivery/Streams/Stream/StreamLanding';
import { renderWithTheme } from 'src/utilities/testHelpers';

import type { Flags } from 'src/featureFlags';

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
  const renderComponent = (flags: Partial<Flags>) => {
    renderWithTheme(<StreamLanding />, {
      flags,
      initialRoute: '/logs/delivery/streams/$streamId/summary',
    });
  };

  describe('and stream has loaded successfully', () => {
    beforeEach(async () => {
      queryMocks.useStreamQuery.mockReturnValue({
        data: mockStream,
        isLoading: false,
      });
    });

    describe('and metrics are not enabled', () => {
      const flags = {
        aclpLogs: {
          enabled: true,
          beta: false,
          metricsEnabled: false,
        },
      };

      it('should render the summary and not the metrics tab', async () => {
        renderComponent(flags);

        screen.getByText('Summary');
        expect(screen.queryByText('Metrics')).not.toBeInTheDocument();
      });
    });

    describe('and metrics are enabled', () => {
      const flags = {
        aclpLogs: {
          enabled: true,
          beta: false,
          metricsEnabled: true,
        },
      };

      it('should render the summary tab and metrics tab', async () => {
        renderComponent(flags);

        screen.getByText('Summary');
        expect(screen.queryByText('Metrics')).toBeInTheDocument();
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
      renderComponent({});

      expect(screen.queryByText('Summary')).not.toBeInTheDocument();
      expect(screen.queryByText('Metrics')).not.toBeInTheDocument();

      const loadingElement = screen.queryByTestId('circle-progress');
      expect(loadingElement).toBeInTheDocument();
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
      renderComponent({});

      expect(screen.queryByText('Summary')).not.toBeInTheDocument();
      expect(screen.queryByText('Metrics')).not.toBeInTheDocument();

      expect(screen.queryByText(streamErrorMessage)).toBeInTheDocument();
    });
  });
});
