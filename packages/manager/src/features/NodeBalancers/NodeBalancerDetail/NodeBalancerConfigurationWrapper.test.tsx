import {
  nodeBalancerConfigFactory,
  nodeBalancerConfigNodeFactory,
} from '@linode/utilities';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithRouter } from 'src/utilities/testHelpers';

import { NodeBalancerConfigurationsWrapper } from './NodeBalancerConfigurationWrapper';

const loadingTestId = 'circle-progress';

const nodeBalancerConfig = nodeBalancerConfigFactory.build({
  id: 1,
  port: 3000,
});

describe('NodeBalancerConfigurations', () => {
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
      wrapWithRouter(<NodeBalancerConfigurationsWrapper />, {
        initialRoute: '/nodebalancers/$id/configurations',
      })
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
    expect(
      getByText(
        'The unique inbound port that this NodeBalancer configuration will listen on.'
      )
    ).toBeInTheDocument();
    expect(getByText('Active Health Checks')).toBeInTheDocument();
    expect(
      getByText(
        'Routes subsequent requests from the client to the same backend.'
      )
    ).toBeInTheDocument();
    expect(
      getByText(
        "When enabled, the NodeBalancer monitors requests to backends. If a request times out, returns a 5xx response (except 501/505), or fails to connect, the backend is marked 'down' and removed from rotation."
      )
    ).toBeInTheDocument();
    expect(
      getByText(
        "Monitors backends to ensure they’re 'up' and handling requests."
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
      wrapWithRouter(<NodeBalancerConfigurationsWrapper />, {
        initialRoute: '/nodebalancers/$id/configurations',
      })
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
      wrapWithRouter(<NodeBalancerConfigurationsWrapper />, {
        initialRoute: '/nodebalancers/$id/configurations',
      })
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
      wrapWithRouter(<NodeBalancerConfigurationsWrapper />, {
        initialRoute: '/nodebalancers/$id/configurations',
      })
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
