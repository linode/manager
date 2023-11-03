import * as React from 'react';

import { longviewLoad, systemInfo } from 'src/__data__/longview';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LoadGauge } from './Load';

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
        ...longviewLoad,
        ...systemInfo,
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

describe('Longview Load Gauge UI', () => {
  it('should render a loading state initially', () => {
    const { getByText } = renderWithTheme(<LoadGauge clientID={123} />, {
      customStore: loadingStore,
    });

    expect(getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render an error state on 400 responses', async () => {
    const { findByText } = renderWithTheme(<LoadGauge clientID={123} />, {
      customStore: errorStore,
    });

    await findByText(/Error/);
  });

  it('should render a data state on 200 responses', async () => {
    const { findByTestId } = renderWithTheme(<LoadGauge clientID={123} />, {
      customStore: dataStore,
    });

    const innerText = await findByTestId('gauge-innertext');

    expect(innerText).toHaveTextContent('2');
  });
});
