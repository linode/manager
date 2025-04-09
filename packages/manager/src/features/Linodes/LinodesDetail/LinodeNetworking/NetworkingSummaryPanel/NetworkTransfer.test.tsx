import React from 'react';

import {
  accountTransferFactory,
  linodeTransferFactory,
  regionFactory,
} from 'src/factories';
import { typeFactory } from 'src/factories/types';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NetworkTransfer } from './NetworkTransfer';
import { calculatePercentageWithCeiling } from './utils';

describe('calculatePercentage', () => {
  it('returns the correct percentage of a value in relation to a target', () => {
    expect(calculatePercentageWithCeiling(50, 100)).toBe(50);
    expect(calculatePercentageWithCeiling(50, 200)).toBe(25);
    expect(calculatePercentageWithCeiling(50, 50)).toBe(100);
  });
  it('caps the percentage at 100', () => {
    expect(calculatePercentageWithCeiling(101, 100)).toBe(100);
  });
});

describe('renders the component with the right data', () => {
  it('renders the component with the right data', async () => {
    const type = typeFactory.build();

    const accountTransfer = accountTransferFactory.build();
    const linodeTransfer = linodeTransferFactory.build();

    server.use(
      http.get('*/v4/linode/types/:id', () => {
        return HttpResponse.json(type);
      }),
      http.get('*/v4/account/transfer', () => {
        return HttpResponse.json(accountTransfer);
      }),
      http.get('*/v4/linode/instances/:id/transfer', () => {
        return HttpResponse.json(linodeTransfer);
      })
    );

    const { findByText, getByText } = renderWithTheme(
      <NetworkTransfer
        linodeId={1234}
        linodeLabel="test-linode"
        linodeRegionId="us-east"
        linodeType="g6-standard-1"
      />
    );

    expect(getByText('Monthly Network Transfer')).toBeInTheDocument();

    expect(await findByText('test-linode (0.01 GB - 1%)')).toBeInTheDocument();
    expect(
      await findByText('Global Pool Used (9000 GB - 36%)')
    ).toBeInTheDocument();
    expect(
      await findByText('Global Pool Remaining (16000 GB)')
    ).toBeInTheDocument();
  });

  it('renders the DC specific pricing copy for linodes in eligible regions', async () => {
    const type = typeFactory.build({
      region_prices: [{ hourly: 1, id: 'br-gru', monthly: 5 }],
    });
    const accountTransfer = accountTransferFactory.build({
      region_transfers: [
        { billable: 0, id: 'br-gru', quota: 15000, used: 500 },
      ],
    });
    const linodeTransfer = linodeTransferFactory.build({
      region_transfers: [
        {
          billable: 0,
          id: 'br-gru',
          quota: 1500, // GB
          used: 90000000000, // Bytes
        },
      ],
    });
    const region = regionFactory.build({
      country: 'br',
      id: 'br-gru',
      label: 'Sao Paulo, BR',
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      }),
      http.get('*/v4/linode/types/:id', () => {
        return HttpResponse.json(type);
      }),
      http.get('*/v4/account/transfer', () => {
        return HttpResponse.json(accountTransfer);
      }),
      http.get('*/v4/linode/instances/:id/transfer', () => {
        return HttpResponse.json(linodeTransfer);
      })
    );

    const { findByText, getByText } = renderWithTheme(
      <NetworkTransfer
        linodeId={1234}
        linodeLabel="test-linode"
        linodeRegionId="br-gru"
        linodeType="g6-standard-1"
      />
    );

    expect(getByText('Monthly Network Transfer')).toBeInTheDocument();
    expect(await findByText('test-linode (83.8 GB - 1%)')).toBeInTheDocument();
    expect(
      await findByText('BR, Sao Paulo Transfer Used (500 GB - 4%)')
    ).toBeInTheDocument();
    expect(
      await findByText('BR, Sao Paulo Transfer Remaining (14500 GB)')
    ).toBeInTheDocument();
  });
});
