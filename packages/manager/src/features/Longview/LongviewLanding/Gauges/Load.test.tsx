import { cleanup, waitForElement } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { longviewLoad, systemInfo } from 'src/__data__/longview';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { baseRequest } from '../../request';
import Load from './Load';

const mockApi = new MockAdapter(baseRequest);

afterEach(cleanup);

afterAll(async done => {
  done();
});

describe('Longview Load Gauge UI', () => {
  it('should render a loading state initially', () => {
    const { getByText } = renderWithTheme(<Load lastUpdated={0} token="" />);

    expect(getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render an error state on 400 responses', async () => {
    const { getByText } = renderWithTheme(<Load lastUpdated={0} token="" />);

    mockApi.onPost().reply(400, [
      {
        /** everything inside is the response from the Longview API */
        NOTIFICATIONS: [],
        DATA: {
          ...longviewLoad,
          ...systemInfo
        }
      }
    ]);

    const resolvedDiv = await waitForElement(() => getByText(/Error/));

    expect(resolvedDiv).toHaveTextContent(/Error/);
  });

  it('should render a data state on 200 responses', async () => {
    const { getByTestId } = renderWithTheme(<Load lastUpdated={0} token="" />);

    mockApi.onPost().reply(200, [
      {
        /** everything inside is the response from the Longview API */
        NOTIFICATIONS: [],
        DATA: {
          ...longviewLoad,
          ...systemInfo
        }
      }
    ]);

    const innerText = await waitForElement(() =>
      getByTestId('gauge-innertext')
    );
    const subtext = await waitForElement(() => getByTestId('gauge-subtext'));

    expect(innerText).toHaveTextContent('2');
    expect(subtext).toHaveTextContent('100% Overallocated');
  });
});
