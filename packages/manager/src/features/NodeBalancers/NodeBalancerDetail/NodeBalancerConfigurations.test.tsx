import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  nodeBalancerConfigFactory,
  nodeBalancerConfigNodeFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import NodeBalancerConfigurations from './NodeBalancerConfigurations';

const props = {
  grants: undefined,
  nodeBalancerLabel: 'nb-1',
  nodeBalancerRegion: 'us-east',
};

const loadingTestId = 'circle-progress';
const memoryRouter = { initialEntries: ['nodebalancers/1/configurations'] };
const routePath = 'nodebalancers/:nodeBalancerId/configurations';

const nodeBalancerConfig = nodeBalancerConfigFactory.build({
  id: 1,
  port: 3000,
});

describe('NodeBalancerConfigurations', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('renders the NodeBalancerConfigurations component with one configuration', async () => {
    server.use(
      http.get(`*/nodebalancers/:id/configs`, () => {
        return HttpResponse.json(makeResourcePage([nodeBalancerConfig]));
      }),
      http.get(`*/nodebalancers/:id/configs/1/nodes`, () => {
        return HttpResponse.json(
          makeResourcePage([nodeBalancerConfigNodeFactory.build({ id: 1 })])
        );
      })
    );

    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      <NodeBalancerConfigurations {...props} />,
      {
        MemoryRouter: memoryRouter,
        routePath,
      }
    );

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Expected after mocking the configs returned
    expect(getByText('Port 3000')).toBeVisible();
    expect(getByLabelText('Protocol')).toBeInTheDocument();
    expect(getByLabelText('Algorithm')).toBeInTheDocument();
    expect(getByLabelText('Session Stickiness')).toBeInTheDocument();
    expect(getByLabelText('Type')).toBeInTheDocument();
    expect(getByLabelText('Label')).toBeInTheDocument();
    expect(getByLabelText('IP Address')).toBeInTheDocument();
    expect(getByLabelText('Weight')).toBeInTheDocument();
    expect(getByLabelText('Port')).toBeInTheDocument();
    expect(getByText('Listen on this port.')).toBeInTheDocument();
    expect(getByText('Active Health Checks')).toBeInTheDocument();
    expect(
      getByText(
        'Route subsequent requests from the client to the same backend.'
      )
    ).toBeInTheDocument();
    expect(
      getByText(
        'Enable passive checks based on observing communication with back-end nodes.'
      )
    ).toBeInTheDocument();
    expect(
      getByText(
        "Active health checks proactively check the health of back-end nodes. 'HTTP Valid Status' requires a 2xx or 3xx response from the backend node. 'HTTP Body Regex' uses a regex to match against an expected result body."
      )
    ).toBeInTheDocument();
    expect(getByText('Add a Node')).toBeInTheDocument();
    expect(getByText('Backend Nodes')).toBeInTheDocument();

    // Since there is an existing configuration, the Add Configuration button says 'Add Another Configuration'
    expect(getByText('Add Another Configuration')).toBeVisible();
  });

  it('renders the NodeBalancerConfigurations component with no configurations', async () => {
    server.use(
      http.get(`*/nodebalancers/:id/configs`, () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByTestId, getByText, queryByLabelText } = renderWithTheme(
      <NodeBalancerConfigurations {...props} />,
      {
        MemoryRouter: memoryRouter,
        routePath,
      }
    );

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // confirm there are no configs
    expect(queryByLabelText('Protocol')).not.toBeInTheDocument();
    expect(queryByLabelText('Algorithm')).not.toBeInTheDocument();
    expect(queryByLabelText('Session Stickiness')).not.toBeInTheDocument();

    // Since there are no existing configurations, the Add Configuration button says 'Add a Configuration'
    expect(getByText('Add a Configuration')).toBeVisible();
  });

  it('adds another configuration', async () => {
    server.use(
      http.get(`*/nodebalancers/:id/configs`, () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByTestId, getByText, queryByLabelText } = renderWithTheme(
      <NodeBalancerConfigurations {...props} />,
      {
        MemoryRouter: memoryRouter,
        routePath,
      }
    );

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // confirm no configuration exists yet
    expect(queryByLabelText('Protocol')).not.toBeInTheDocument();
    expect(queryByLabelText('Algorithm')).not.toBeInTheDocument();
    expect(queryByLabelText('Session Stickiness')).not.toBeInTheDocument();

    await userEvent.click(getByText('Add a Configuration'));

    // confirm new configuration has been added
    expect(queryByLabelText('Protocol')).toBeVisible();
    expect(queryByLabelText('Algorithm')).toBeVisible();
    expect(queryByLabelText('Session Stickiness')).toBeVisible();
  });

  it('opens the Delete Configuration dialog', async () => {
    server.use(
      http.get(`*/nodebalancers/:id/configs`, () => {
        return HttpResponse.json(makeResourcePage([nodeBalancerConfig]));
      }),
      http.get(`*/nodebalancers/:id/configs/1/nodes`, () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      <NodeBalancerConfigurations {...props} />,
      {
        MemoryRouter: memoryRouter,
        routePath,
      }
    );

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(getByText('Port 3000')).toBeVisible();
    expect(getByLabelText('Protocol')).toBeInTheDocument();
    expect(getByLabelText('Algorithm')).toBeInTheDocument();

    await userEvent.click(getByText('Delete'));

    expect(getByText('Delete this configuration on port 3000?')).toBeVisible();
    expect(
      getByText(
        'Are you sure you want to delete this NodeBalancer Configuration?'
      )
    ).toBeVisible();
  });
});
