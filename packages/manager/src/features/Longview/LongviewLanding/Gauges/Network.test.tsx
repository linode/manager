import * as React from 'react';

import { network as mockNetworkData } from 'src/__data__/longview';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { generateUsedNetworkAsBytes, NetworkGauge } from './Network';

const mockError = [{ CODE: 0, SEVERITY: 3, TEXT: 'no reason' }];

const loadingStore = {
  longviewStats: {
    123: {
      loading: true,
    },
  },
};

const dataStore = {
  longviewStats: {
    123: {
      data: {
        ...mockNetworkData,
      },
      loading: false,
    },
  },
};

const errorStore = {
  longviewStats: {
    123: {
      error: mockError,
      loading: false,
    },
  },
};

describe('Utility Functions', () => {
  it('should aggregate max inbound and outbound network bandwidth correctly', () => {
    expect(generateUsedNetworkAsBytes(mockNetworkData.Network.Interface)).toBe(
      524288
    );
  });
});

describe('Longview Network Gauge UI', () => {
  it('should render a loading state initially', () => {
    const { getByText } = renderWithTheme(<NetworkGauge clientID={123} />, {
      customStore: loadingStore,
    });

    expect(getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render an error state upon Redux Error State', async () => {
    const { findByText } = renderWithTheme(<NetworkGauge clientID={123} />, {
      customStore: errorStore,
    });

    await findByText(/Error/);
  });

  it('should render a data state when data is in Redux state', async () => {
    const { findByTestId } = renderWithTheme(<NetworkGauge clientID={123} />, {
      customStore: dataStore,
    });

    const innerText = await findByTestId('gauge-innertext');
    const subtext = await findByTestId('gauge-subtext');

    expect(innerText).toHaveTextContent('4 Mb/s');
    expect(subtext).toHaveTextContent('Network');
  });
});
