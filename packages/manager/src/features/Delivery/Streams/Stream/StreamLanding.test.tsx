import { screen } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, it } from 'vitest';

import {
  akamaiObjectStorageDestinationFactory,
  streamFactory,
} from 'src/factories';
import { StreamLanding } from 'src/features/Delivery/Streams/Stream/StreamLanding';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import type { Flags } from 'src/featureFlags';

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

  beforeEach(async () => {
    server.use(
      http.get(`*/monitor/streams/${streamId}`, () => {
        return HttpResponse.json(mockStream);
      })
    );
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
