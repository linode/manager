import { cleanup, waitForElement } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { memory as mockMemory } from 'src/__data__/longview';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { baseRequest } from '../../request';
import RAM, { generateTotalMemory, generateUsedMemory } from './RAM';

const mockApi = new MockAdapter(baseRequest);

afterEach(cleanup);

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
    const { getByText } = renderWithTheme(<RAM lastUpdated={0} token="" />);

    expect(getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render an error state on 400 responses', async done => {
    const { getByText } = renderWithTheme(<RAM lastUpdated={0} token="" />);

    mockApi.onPost().reply(400, [
      {
        /** everything inside is the response from the Longview API */
        NOTIFICATIONS: [],
        DATA: {
          ...mockMemory
        }
      }
    ]);

    const resolvedDiv = await waitForElement(() => getByText(/Error/));

    expect(resolvedDiv).toHaveTextContent(/Error/);
    done();
  });

  it('should render a data state on 200 responses', async done => {
    const { getByTestId } = renderWithTheme(<RAM lastUpdated={0} token="" />);

    mockApi.onPost().reply(200, [
      {
        /** everything inside is the response from the Longview API */
        NOTIFICATIONS: [],
        DATA: {
          ...mockMemory
        }
      }
    ]);

    const innerText = await waitForElement(() =>
      getByTestId('gauge-innertext')
    );
    const subtext = await waitForElement(() => getByTestId('gauge-subtext'));
    done();

    expect(innerText).toHaveTextContent('4.69 MB');
    expect(subtext).toHaveTextContent('1.91 GB');
  });
});
