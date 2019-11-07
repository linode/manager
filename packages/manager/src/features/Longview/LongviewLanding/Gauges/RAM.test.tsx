import { cleanup, waitForElement } from '@testing-library/react';
import * as React from 'react';
import { memory } from 'src/__data__/longview';
import { renderWithTheme } from 'src/utilities/testHelpers';
import RAM, { generateTotalMemory, generateUsedMemory } from './RAM';

afterEach(cleanup);

const loadingStore = {
  longviewStats: {
    123: {
      loading: true,
      data: {
        ...memory
      }
    }
  }
};

const dataStore = {
  longviewStats: {
    123: {
      loading: false,
      data: {
        ...memory
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
  it('should generate used memory correctly', () => {
    expect(generateUsedMemory(400, 100, 100)).toBe(200);
    expect(generateUsedMemory(0, 100, 100)).toBe(0);
    expect(generateUsedMemory(1000, 100, 100)).toBe(800);
  });

  it('should generate total memory correctly', () => {
    expect(generateTotalMemory(100, 400)).toBe(500);
    expect(generateTotalMemory(500, 400)).toBe(900);
    expect(generateTotalMemory(100, 900)).toBe(1000);
  });
});

describe('Longview RAM Gauge UI', () => {
  it('should render a loading state initially', () => {
    const { getByText } = renderWithTheme(<RAM clientID={123} />, loadingStore);

    expect(getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render error UI if an error comes back from Redux State', async done => {
    const { getByText } = renderWithTheme(<RAM clientID={123} />, errorStore);

    const resolvedDiv = await waitForElement(() => getByText(/Error/));

    expect(resolvedDiv).toHaveTextContent(/Error/);
    done();
  });

  it('should render a data state UI if data comes back from Redux State', async done => {
    const { getByTestId } = renderWithTheme(<RAM clientID={123} />, dataStore);

    const innerText = await waitForElement(() =>
      getByTestId('gauge-innertext')
    );
    const subtext = await waitForElement(() => getByTestId('gauge-subtext'));
    done();

    expect(innerText).toHaveTextContent('4.69 MB');
    expect(subtext).toHaveTextContent('1.91 GB');
  });
});
