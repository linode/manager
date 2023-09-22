import * as React from 'react';

import { memory } from 'src/__data__/longview';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RAMGauge } from './RAM';

const mockError = [{ CODE: 0, SEVERITY: 3, TEXT: 'no reason' }];

const loadingStore = {
  longviewStats: {
    123: {
      data: {
        ...memory,
      },
      loading: true,
    },
  },
};

const dataStore = {
  longviewStats: {
    123: {
      data: {
        ...memory,
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

describe('Longview RAM Gauge UI', () => {
  it('should render a loading state initially', () => {
    const { getByText } = renderWithTheme(<RAMGauge clientID={123} />, {
      customStore: loadingStore,
    });

    expect(getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render error UI if an error comes back from Redux State', async (done) => {
    const { findByText } = renderWithTheme(<RAMGauge clientID={123} />, {
      customStore: errorStore,
    });

    const resolvedDiv = await findByText(/Error/);

    expect(resolvedDiv).toHaveTextContent(/Error/);
    done();
  });

  it('should render a data state UI if data comes back from Redux State', async (done) => {
    const { findByTestId } = renderWithTheme(<RAMGauge clientID={123} />, {
      customStore: dataStore,
    });

    const innerText = await findByTestId('gauge-innertext');
    const subtext = await findByTestId('gauge-subtext');
    done();

    expect(innerText).toHaveTextContent('4.69 MB');
    expect(subtext).toHaveTextContent('1.91 GB');
  });
});
