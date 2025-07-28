import { linodeFactory, linodeIPFactory } from '@linode/utilities';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { getLinodeIPv6Ranges, IPTransfer } from './IPTransfer';

describe('getLinodeIPv6Ranges', () => {
  const ipv6Ranges = [
    {
      prefix: 64,
      range: '2fff:db08:e003:1::',
      region: 'us-east',
      route_target: '2600:3c03::f03c:92ff:fe8d:5c0c',
    },
    {
      prefix: 64,
      range: '2fff:db08:e003:2::',
      region: 'us-east',
      route_target: '2600:3c03::f03c:92ff:fe8d:5c0d',
    },
    {
      prefix: 56,
      range: '2fff:db08:e003:3::',
      region: 'us-east',
      route_target: '2600:3c03::f03c:92ff:fe8d:5c0d',
    },
  ];

  it('returns an array of ranges', () => {
    expect(
      getLinodeIPv6Ranges(ipv6Ranges, '2600:3c03::f03c:92ff:fe8d:5c0d/128')
    ).toEqual(['2fff:db08:e003:2::/64', '2fff:db08:e003:3::/56']);
  });

  it('returns an empty array if at least one argument is undefined or null', () => {
    expect(
      getLinodeIPv6Ranges(undefined, '2600:3c03::f03c:92ff:fe8d:5b1b/128')
    ).toEqual([]);
    expect(getLinodeIPv6Ranges(ipv6Ranges, null)).toEqual([]);
    expect(getLinodeIPv6Ranges(undefined, null)).toEqual([]);
  });

  it('sets the default Linode and IP address when the "Swap With" action is selected.', async () => {
    const [selectedLinode, destinationLinode] = linodeFactory.buildList(2, {
      ipv6: null,
    });
    const mockLinodeIPs = linodeIPFactory.build({ ipv6: undefined });
    server.use(
      http.get('*/linode/instances', () => {
        return HttpResponse.json(
          makeResourcePage([selectedLinode, destinationLinode])
        );
      }),
      http.get('*/linode/instances/:linodeId', () => {
        return HttpResponse.json(selectedLinode);
      }),
      http.get('*/linode/instances/:linodeId/ips', () => {
        return HttpResponse.json(mockLinodeIPs);
      }),
      http.get('*/networking/ipv6/ranges', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const {
      getAllByTestId,
      getByPlaceholderText,
      findByText,
      findByPlaceholderText,
    } = renderWithTheme(
      <IPTransfer linodeId={selectedLinode.id} onClose={vi.fn()} open />
    );

    await waitForElementToBeRemoved(getAllByTestId('circle-progress'));

    const actionSelect = getByPlaceholderText('Select Action');
    await userEvent.click(actionSelect);
    await userEvent.click(await findByText('Swap With'));
    expect(actionSelect).toHaveValue('Swap With');

    const linodeInput = await findByPlaceholderText('Select Linode');
    expect(linodeInput).toHaveValue(destinationLinode.label);

    const IpInput = await screen.findByPlaceholderText('Select IP Address');
    expect(IpInput).toHaveValue(destinationLinode.ipv4[0]);
  });

  it('sets the default Linode when the "Move To" action is selected.', async () => {
    const [selectedLinode, destinationLinode] = linodeFactory.buildList(2, {
      ipv6: null,
    });
    const mockLinodeIPs = linodeIPFactory.build({ ipv6: undefined });
    server.use(
      http.get('*/linode/instances', () => {
        return HttpResponse.json(
          makeResourcePage([selectedLinode, destinationLinode])
        );
      }),
      http.get('*/linode/instances/:linodeId', () => {
        return HttpResponse.json(selectedLinode);
      }),
      http.get('*/linode/instances/:linodeId/ips', () => {
        return HttpResponse.json(mockLinodeIPs);
      }),
      http.get('*/networking/ipv6/ranges', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const {
      getAllByTestId,
      getByPlaceholderText,
      findByText,
      findByPlaceholderText,
    } = renderWithTheme(
      <IPTransfer linodeId={selectedLinode.id} onClose={vi.fn()} open />
    );

    await waitForElementToBeRemoved(getAllByTestId('circle-progress'));

    const actionSelect = getByPlaceholderText('Select Action');
    await userEvent.click(actionSelect);
    await userEvent.click(await findByText('Move To'));
    expect(actionSelect).toHaveValue('Move To');

    const linodeInput = await findByPlaceholderText('Select Linode');
    expect(linodeInput).toHaveValue(destinationLinode.label);
  });
});
