import { cleanup, waitForElement } from '@testing-library/react';
import * as React from 'react';
import { longviewLoad, systemInfo } from 'src/__data__/longview';
import { renderWithTheme } from 'src/utilities/testHelpers';
import Load from './Load';

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
        ...longviewLoad,
        ...systemInfo
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

describe('Longview Load Gauge UI', () => {
  it('should render a loading state initially', () => {
    const { getByText } = renderWithTheme(<Load clientID={123} />, {
      customStore: loadingStore
    });

    expect(getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render an error state on 400 responses', async () => {
    const { getByText } = renderWithTheme(<Load clientID={123} />, {
      customStore: errorStore
    });

    await waitForElement(() => getByText(/Error/));
  });

  it('should render a data state on 200 responses', async () => {
    const { getByTestId } = renderWithTheme(<Load clientID={123} />, {
      customStore: dataStore
    });

    const innerText = await waitForElement(() =>
      getByTestId('gauge-innertext')
    );

    expect(innerText).toHaveTextContent('2');
  });
});
