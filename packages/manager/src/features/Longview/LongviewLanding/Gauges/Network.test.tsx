import { cleanup, waitForElement } from '@testing-library/react';
import * as React from 'react';
import { network as mockNetworkData } from 'src/__data__/longview';
import { renderWithTheme } from 'src/utilities/testHelpers';
import Network, { generateUnits, generateUsedNetworkAsBytes } from './Network';

afterEach(cleanup);

const loadingStore = {
  longviewStats: {
    123: {
      loading: true
    }
  }
};

const dataStore = {
  longviewStats: {
    123: {
      loading: false,
      data: {
        ...mockNetworkData
      }
    }
  }
};

const errorStore = {
  longviewStats: {
    123: {
      loading: false,
      error: [
        {
          reason: 'this is an error'
        }
      ]
    }
  }
};

describe('Utility Functions', () => {
  it('should aggregate max inbound and outbound network bandwidth correctly', () => {
    expect(generateUsedNetworkAsBytes(mockNetworkData.Network.Interface)).toBe(
      524288
    );
  });

  it('should generate the correct units and values', () => {
    const oneKilobitAsBytes = 128;
    const oneMegabitAsBytes = 131072;
    expect(generateUnits(oneKilobitAsBytes)).toEqual({ unit: 'Kb', value: 1 });
    expect(generateUnits(oneMegabitAsBytes * 3)).toEqual({
      unit: 'Mb',
      value: 3
    });
  });
});

describe('Longview Network Gauge UI', () => {
  it('should render a loading state initially', () => {
    const { getByText } = renderWithTheme(<Network clientID={123} />, {
      customStore: loadingStore
    });

    expect(getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render an error state upon Redux Error State', async () => {
    const { getByText } = renderWithTheme(<Network clientID={123} />, {
      customStore: errorStore
    });

    await waitForElement(() => getByText(/Error/), {});
  });

  it('should render a data state when data is in Redux state', async () => {
    const { getByTestId } = renderWithTheme(<Network clientID={123} />, {
      customStore: dataStore
    });

    const innerText = await waitForElement(
      () => getByTestId('gauge-innertext'),
      {}
    );
    const subtext = await waitForElement(
      () => getByTestId('gauge-subtext'),
      {}
    );

    expect(innerText).toHaveTextContent('4 Mb/s');
    expect(subtext).toHaveTextContent('Network');
  });
});
