import userEvent from '@testing-library/user-event';
import React from 'react';

import { endpointFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EndpointTable } from './EndpointTable';

describe('EndpointTable', () => {
  it('should render a table with endpoints', async () => {
    const endpoints = [
      endpointFactory.build({ host: 'example.com', ip: '1.1.1.1', port: 22 }),
      endpointFactory.build({ host: 'test.com', ip: '8.8.8.8', port: 80 }),
    ];

    const props = {
      endpoints,
      onRemove: jest.fn(),
    };

    const { getByText } = renderWithTheme(<EndpointTable {...props} />);

    for (const endpoint of endpoints) {
      expect(getByText(`${endpoint.ip}:${endpoint.port}`)).toBeVisible();

      if (endpoint.host) {
        expect(getByText(endpoint.host)).toBeInTheDocument();
      }
    }
  });
  it('should call onRemove with the endpoint index when the remove button is clicked', async () => {
    const endpoints = [
      endpointFactory.build({ host: 'example.com', ip: '1.1.1.1', port: 22 }),
      endpointFactory.build({ host: 'test.com', ip: '8.8.8.8', port: 80 }),
    ];

    const props = {
      endpoints,
      onRemove: jest.fn(),
    };

    const { getByLabelText } = renderWithTheme(<EndpointTable {...props} />);

    for (const endpoint of endpoints) {
      const removeEndpointButton = getByLabelText(
        `Remove Endpoint ${endpoint.ip}:${endpoint.port}`
      );

      expect(removeEndpointButton).toBeVisible();

      userEvent.click(removeEndpointButton);

      expect(props.onRemove).toBeCalledWith(endpoints.indexOf(endpoint));
    }
  });
  it('should display all possible API errors', async () => {
    const endpoints = [
      endpointFactory.build({ host: 'example.com', ip: '1.1.1.1', port: 22 }),
      endpointFactory.build({ host: 'test.com', ip: '8.8.8.8', port: 80 }),
    ];

    const errors = [
      { field: 'endpoints[0].ip', reason: 'That is not a valid IPv4.' },
      { field: 'endpoints[0].port', reason: 'That is not a valid port.' },
      { field: 'endpoints[1].host', reason: 'That is not a valid host.' },
      {
        field: 'endpoints[1].rate_capacity',
        reason: 'rate_capacity must be non-negative',
      },
    ];

    const props = {
      endpoints,
      errors,
      onRemove: jest.fn(),
    };

    const { getByText } = renderWithTheme(<EndpointTable {...props} />);

    for (const error of errors) {
      expect(getByText(error.reason)).toBeVisible();
    }
  });
});
