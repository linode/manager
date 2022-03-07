import * as React from 'react';
import { longviewLoad, systemInfo } from 'src/__data__/longview';
import { renderWithTheme } from 'src/utilities/testHelpers';
import Load from './Load';

const mockError = [{ TEXT: 'no reason', CODE: 0, SEVERITY: 3 }];

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
      loading: false,
      data: {
        ...longviewLoad,
        ...systemInfo,
      },
    },
  },
};

const errorStore = {
  longviewStats: {
    123: {
      loading: false,
      error: mockError,
    },
  },
};

describe('Longview Load Gauge UI', () => {
  it('should render a loading state initially', () => {
    const { getByText } = renderWithTheme(<Load clientID={123} />, {
      customStore: loadingStore,
    });

    expect(getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render an error state on 400 responses', async () => {
    const { findByText } = renderWithTheme(<Load clientID={123} />, {
      customStore: errorStore,
    });

    await findByText(/Error/);
  });

  it('should render a data state on 200 responses', async () => {
    const { findByTestId } = renderWithTheme(<Load clientID={123} />, {
      customStore: dataStore,
    });

    const innerText = await findByTestId('gauge-innertext');

    expect(innerText).toHaveTextContent('2');
  });
});
