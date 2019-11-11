import { cleanup, waitForElement } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { network as mockNetworkData } from 'src/__data__/longview';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { baseRequest } from '../../request';
import Network, { generateUnits, generateUsedNetworkAsBytes } from './Network';

const mockApi = new MockAdapter(baseRequest);

afterEach(cleanup);

afterAll(async done => {
  done();
});

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
    const { getByText } = renderWithTheme(<Network lastUpdated={0} token="" />);

    expect(getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render an error state on 400 responses', async () => {
    const { getByText } = renderWithTheme(<Network lastUpdated={0} token="" />);

    mockApi.onPost().reply(400, [
      {
        /** everything inside is the response from the Longview API */
        NOTIFICATIONS: [],
        DATA: {
          ...mockNetworkData
        }
      }
    ]);

    await waitForElement(() => getByText(/Error/));
  });

  it('should render a data state on 200 responses', async () => {
    const { getByTestId } = renderWithTheme(
      <Network lastUpdated={0} token="" />
    );

    mockApi.onPost().reply(200, [
      {
        /** everything inside is the response from the Longview API */
        NOTIFICATIONS: [],
        DATA: {
          ...mockNetworkData
        }
      }
    ]);

    const innerText = await waitForElement(() =>
      getByTestId('gauge-innertext')
    );
    const subtext = await waitForElement(() => getByTestId('gauge-subtext'));

    expect(innerText).toHaveTextContent('4 Mb/s');
    expect(subtext).toHaveTextContent('Network');
  });
});
